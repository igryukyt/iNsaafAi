import os
import json
import logging
import re
import numpy as np
import pickle
from flask import Blueprint, request, jsonify
from sentence_transformers import SentenceTransformer, util
from deep_translator import GoogleTranslator

# Initialize Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

api = Blueprint('api', __name__)

# --- Configuration & Global State ---
IPC_DATA = []
SBERT_MODEL = None
IPC_EMBEDDINGS = None

def load_resources():
    """Loads IPC data and initializes the SBERT model for semantic search."""
    global IPC_DATA, SBERT_MODEL, IPC_EMBEDDINGS
    
    # Locate data file
    base_dir = os.path.dirname(os.path.abspath(__file__))
    # Assuming routes.py is in Final InsaafAI/Final InsaafAI/api/
    # And ipc_data.json is in Final InsaafAI/Final InsaafAI/
    root_dir = os.path.dirname(base_dir) 
    data_path = os.path.join(root_dir, 'ipc_data.json')
    cache_path = os.path.join(root_dir, 'ipc_embeddings.pkl')
    
    try:
        logger.info("Loading IPC Data...")
        if os.path.exists(data_path):
            with open(data_path, 'r', encoding='utf-8') as f:
                IPC_DATA = json.load(f)
            logger.info(f"Loaded {len(IPC_DATA)} IPC sections.")
        else:
            logger.error(f"IPC Data file not found at {data_path}")
            IPC_DATA = []

        logger.info("Loading Sentence-BERT Model...")
        # using a lightweight model for speed and efficiency
        SBERT_MODEL = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Check for cached embeddings
        if os.path.exists(cache_path):
             logger.info("Loading cached IPC Embeddings...")
             try:
                 with open(cache_path, 'rb') as f:
                     IPC_EMBEDDINGS = pickle.load(f)
                 logger.info("Cached embeddings loaded successfully.")
             except Exception as e:
                 logger.warning(f"Failed to load cache, recomputing: {e}")
                 IPC_EMBEDDINGS = None

        # Pre-compute embeddings if not cached
        if IPC_DATA and IPC_EMBEDDINGS is None:
            logger.info("Computing IPC Embeddings (this may take a moment)...")
            # Combine title and description for better matching
            corpus = [
                f"{item.get('section_title', '')} {item.get('section_desc', '')}" 
                for item in IPC_DATA
            ]
            IPC_EMBEDDINGS = SBERT_MODEL.encode(corpus, convert_to_tensor=True)
            
            # Save to cache
            try:
                with open(cache_path, 'wb') as f:
                    pickle.dump(IPC_EMBEDDINGS, f)
                logger.info("Embeddings computed and cached.")
            except Exception as e:
                logger.error(f"Failed to save embedding cache: {e}")

    except Exception as e:
        logger.critical(f"Failed to initialize resources: {e}", exc_info=True)

# Initialize on module import
load_resources()

# --- Search Engine Logic ---

class IPCSearchEngine:
    @staticmethod
    def search(query, top_k=3):
        """
        Searches IPC sections using a hybrid approach:
        1. Direct Section Number Matching
        2. Keyword/Semantic Search using SBERT
        3. Fuzzy matching for suggestions if no results
        """
        if not IPC_DATA:
            return []

        query = query.strip()
        results = []

        # 1. Direct Section Match
        section_match = re.search(r'(?:section|sec|ipc|^)\s*(\d+[a-z]?)', query.lower())
        
        exact_match_found = False
        if section_match:
            sec_num = section_match.group(1).upper()
            exact_match = next((item for item in IPC_DATA if str(item.get('Section')).upper() == sec_num), None)
            if exact_match:
                exact_match_found = True
                results.append({
                    "matched_section": str(exact_match['Section']),
                    "section_title": exact_match['section_title'],
                    "legal_description": exact_match['section_desc'],
                    "simplified_explanation": f"This section deals with {exact_match['section_title']}.",
                    "confidence": 1.0,
                    "type": "Exact"
                })

        # 2. Semantic Search
        # Run if no exact match OR if query is descriptive (longer than 3 words)
        should_run_semantic = True
        
        # If user just typed "302" or "Section 302", DON'T run semantic search. It confuses things.
        if exact_match_found and len(query.split()) < 5:
            should_run_semantic = False
            
        # Also, if query looks like just a number but didn't match (e.g. "9999"), semantic search won't help.
        if re.fullmatch(r'\d+', query) and not exact_match_found:
             should_run_semantic = False

        if should_run_semantic and SBERT_MODEL and IPC_EMBEDDINGS is not None:
             # ... (existing semantic search code)
            query_embedding = SBERT_MODEL.encode(query, convert_to_tensor=True)
            hits = util.semantic_search(query_embedding, IPC_EMBEDDINGS, top_k=5)[0]
            
            for hit in hits:
                score = float(hit['score'])
                
                # Dynamic Thresholding
                threshold = 0.35 if exact_match_found else 0.25
                
                if score < threshold: 
                    continue
                    
                idx = hit['corpus_id']
                item = IPC_DATA[idx]
                
                # Avoid duplicates
                if any(r['matched_section'] == str(item['Section']) for r in results):
                    continue

                match_type = "High Confidence" if score > 0.45 else "Suggestion"

                results.append({
                    "matched_section": str(item['Section']),
                    "section_title": item['section_title'],
                    "legal_description": item['section_desc'],
                    "simplified_explanation": f"Relevant to: {item['section_title']}",
                    "confidence": round(score, 2),
                    "type": match_type
                })

        # 3. Fallback: Fuzzy Text Search
        if not results and not re.fullmatch(r'\d+', query):
             keywords = query.lower().split()
             for item in IPC_DATA:
                 title = item['section_title'].lower()
                 if any(k in title for k in keywords if len(k) > 4):
                     results.append({
                        "matched_section": str(item['Section']),
                        "section_title": item['section_title'],
                        "legal_description": item['section_desc'],
                        "simplified_explanation": f"Found via keyword match: {item['section_title']}",
                        "confidence": 0.2, 
                        "type": "Suggestion"
                    })
                     if len(results) >= 2: break

        # Sort: Exact First, then Confidence
        results.sort(key=lambda x: (x['type'] != 'Exact', -x['confidence']))
        return results[:top_k]

# --- API Endpoints ---

@api.route('/assistant', methods=['POST'])
def assistant():
    """
    Main endpoint for the AI Legal Assistant.
    Input: { "query": "text..." }
    Output: Structured JSON with matched IPC sections.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400
            
        user_query = data.get('query', '').strip()
        
        if not user_query:
            return jsonify({
                "matches": [],
                "message": "Please provide a valid legal query.",
                "confidence": 0.0
            }), 400
            
        # Hindi to English Translation
        if any('\u0900' <= char <= '\u097F' for char in user_query):
            try:
                user_query = GoogleTranslator(source='auto', target='en').translate(user_query)
            except Exception as e:
                logger.warning(f"Translation failed: {e}")

        # Search
        results = IPCSearchEngine.search(user_query)
        
        if not results:
            return jsonify({
                "matches": [],
                "message": "I couldn't find a close match. Try checking the spelling or describing the crime in more detail.",
                "confidence": "None"
            })
            
        best_match = results[0]
        msg = "Analysis successful."
        
        if best_match.get('type') == 'Suggestion':
            msg = "I wasn't sure, but here are some sections that might be relevant:"
        elif best_match.get('confidence', 0) < 0.5:
             msg = "Here are the closest matches I found:"

        response = {
            "status": "success",
            "matches": results,
            "best_match": best_match,
            "message": msg
        }
        
        logger.info(f"Query processed: '{user_query[:50]}...' -> Found {len(results)} matches.")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error in /assistant endpoint: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error"}), 500

        return jsonify({"status": "active", "models_loaded": SBERT_MODEL is not None})

@api.route('/ipc/search', methods=['POST'])
def search_ipc():
    """
    Endpoint for searching IPC sections.
    Input: { "query": "text", "lang": "en" }
    Output: Structured JSON with section details.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "Invalid JSON"}), 400
            
        query = data.get('query', '').strip()
        lang = data.get('lang', 'en') # Currently unused, but good for future
        
        if not query:
             return jsonify({"message": "Please enter a search term."}), 400

        # Search using the engine
        results = IPCSearchEngine.search(query, top_k=1)
        
        if not results:
            return jsonify({"message": "No matching section found."}), 404
            
        best = results[0]
        
        # Return format expected by frontend searchIPC()
        return jsonify({
            "section": best['matched_section'],
            "title": best['section_title'],
            "chapter": "Unknown", # Dataset doesn't have chapter info yet
            "description": best['legal_description']
        })

    except Exception as e:
        logger.error(f"Error in /ipc/search: {e}", exc_info=True)
        return jsonify({"error": "Internal Server Error"}), 500

# --- Case Analysis Logic ---

def extract_text_from_file(file_storage):
    """
    Extracts text from a FileStorage object (PDF or Text).
    """
    try:
        filename = file_storage.filename.lower()
        if filename.endswith('.pdf'):
            try:
                import pypdf
                reader = pypdf.PdfReader(file_storage)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
            except ImportError:
                logger.error("pypdf not installed. Cannot extract PDF text.")
                return "[Error: System cannot read PDF files currently. Please upload .txt or paste text.]"
            except Exception as e:
                logger.error(f"PDF extraction error: {e}")
                return ""
        elif filename.endswith('.txt'):
            return file_storage.read().decode('utf-8')
        else:
            return ""
    except Exception as e:
        logger.error(f"File read error: {e}")
        return ""

@api.route('/predict', methods=['POST'])
def predict():
    """
    Endpoint for Case Analysis with File Upload support.
    Input: Multipart Form Data
        - description (text)
        - crime_type (text)
        - user_id (text)
        - document (file)
    Output: Structured JSON Analysis
    """
    try:
        # Get Form Data
        description = request.form.get('description', '')
        crime_type = request.form.get('crime_type', '')
        # user_id = request.form.get('user_id') # Not used yet but available
        
        uploaded_file = request.files.get('document')
        file_text = ""
        
        if uploaded_file:
            file_text = extract_text_from_file(uploaded_file)
            
        # Combine Text for Analysis
        full_text = f"{crime_type} {description} {file_text}".strip()
        
        if not full_text:
            return jsonify({
                "outcome": "Incomplete Data",
                "probability": "0%",
                "ipc_section": "N/A",
                "explanation": "Please provide a description or upload a document to proceed with analysis.",
                "action": "Add case details.",
                "section_details": []
            }), 400

        # Run Search
        # We search with the full text but limit to key phrases if it is too long
        search_query = full_text[:500] # Use first 500 chars for search to avoid token limits
        results = IPCSearchEngine.search(search_query, top_k=3)
        
        if not results:
             return jsonify({
                "outcome": "Uncertain Analysis",
                "probability": "Low",
                "ipc_section": "None Found",
                "explanation": "Based on the provided details, no specific IPC section strongly matches. The case might require more specific legal classification.",
                "action": "Consult a legal expert for a manual review.",
                "section_details": []
            })
            
        best_match = results[0]
        confidence_val = best_match.get('confidence', 0)
        confidence_str = f"{int(confidence_val * 100)}%"
        
        # Determine "Outcome" logic (Heuristic based on confidence)
        outcome = "Legal Action Recommended"
        if confidence_val > 0.7:
             outcome = "Strong Case Basis Detected"
        elif confidence_val < 0.3:
             outcome = "Weak/Unclear Case Basis"

        # Generate Statement Summary (Extract from input)
        # If file text exists, use a snippet of it, else use description
        statement_summary = ""
        if file_text:
            statement_summary = "File Content Summary: " + file_text[:200] + "..."
        else:
            statement_summary = "Statement Summary: " + description[:200] + "..."

        # Construct Explanation
        explanation = f"The provided statement aligns with **Section {best_match['matched_section']}** ({best_match['section_title']}). \n\n" \
                      f"**Legal Insight:** {best_match['simplified_explanation']}\n\n" \
                      f"**Case Context:** {statement_summary}"

        # Construct Action
        action = "Gather evidence such as FIR copies, witness statements, and medical reports if applicable. " \
                 "Consult a lawyer to file a case under the identified sections."

        # Simplify section details for frontend
        section_details = []
        for res in results:
            section_details.append({
                "section": res['matched_section'],
                "title": res['section_title'],
                "description": res['legal_description']
            })

        return jsonify({
            "outcome": outcome,
            "probability": confidence_str,
            "ipc_section": f"Section {best_match['matched_section']}",
            "explanation": explanation,
            "action": action,
            "section_details": section_details
        })

    except Exception as e:
        logger.error(f"Error in /predict endpoint: {e}", exc_info=True)
        return jsonify({"outcome": "Error", "explanation": str(e)}), 500
