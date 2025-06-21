import fitz  # PyMuPDF
import re
import nltk
import numpy as np
from nltk.tokenize import sent_tokenize, word_tokenize
from nltk import pos_tag, ne_chunk
from nltk.corpus import stopwords
#from nltk.chunk import tree2conlltags
from pdf2image import convert_from_path
from PIL import Image, ImageDraw
from transformers import BartTokenizer, BartForConditionalGeneration
from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
import statistics
import sys

nltk.download("punkt")
nltk.download("averaged_perceptron_tagger")
nltk.download("stopwords")
nltk.download("maxent_ne_chunker")
nltk.download("words")

def clean_text(text):
    """Enhanced text cleaning with better preprocessing"""
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text).strip()
    # Remove page numbers and common artifacts
    text = re.sub(r'\b\d{1,3}\b$', '', text)  # Remove trailing page numbers
    text = re.sub(r'^[^\w\s]*$', '', text)    # Remove lines with only punctuation
    return text

def extract_proper_nouns_and_entities(text):
    """Extract proper nouns and named entities from text"""
    try:
        # Tokenize and POS tag
        tokens = word_tokenize(text)
        pos_tags = pos_tag(tokens)
        
        # Extract proper nouns (NNP, NNPS)
        proper_nouns = [word for word, tag in pos_tags if tag in ['NNP', 'NNPS']]
        
        # Extract named entities using NLTK's NER
        entities = []
        try:
            chunks = ne_chunk(pos_tags, binary=False)
            for chunk in chunks:
                if hasattr(chunk, 'label'):
                    entity = ' '.join([token for token, pos in chunk.leaves()])
                    entities.append(entity)
        except:
            pass
        
        # Extract capitalized words (potential proper nouns missed by POS tagger)
        capitalized_words = [word for word in tokens if word[0].isupper() and len(word) > 2 and word.isalpha()]
        
        # Combine and deduplicate
        all_proper_terms = list(set(proper_nouns + entities + capitalized_words))
        
        return all_proper_terms
    except:
        return []

def extract_topic_keywords(full_text, top_n=20):
    """Extract topic-specific keywords using TF-IDF"""
    try:
        # Use TF-IDF to find important terms
        tfidf = TfidfVectorizer(
            max_features=100,
            stop_words='english',
            ngram_range=(1, 2),  # Include bigrams
            min_df=2,  # Must appear at least twice
            max_df=0.8  # Exclude overly common terms
        )
        
        # Split text into sentences for TF-IDF analysis
        sentences = sent_tokenize(full_text)
        if len(sentences) < 2:
            return []
            
        tfidf_matrix = tfidf.fit_transform(sentences)
        feature_names = tfidf.get_feature_names_out()
        
        # Get average TF-IDF scores across all sentences
        mean_scores = np.mean(tfidf_matrix.toarray(), axis=0)
        
        # Get top keywords
        top_indices = np.argsort(mean_scores)[-top_n:]
        topic_keywords = [feature_names[i] for i in top_indices if mean_scores[i] > 0.1]
        
        return topic_keywords
    except:
        return []

def calculate_text_features(text, proper_nouns_global, topic_keywords_global):
    """Calculate additional text features for importance scoring"""
    words = word_tokenize(text.lower())
    original_words = word_tokenize(text)  # Keep original case
    stop_words = set(stopwords.words('english'))
    
    # Feature calculations
    word_count = len(words)
    sentence_count = len(sent_tokenize(text))
    avg_word_length = np.mean([len(word) for word in words]) if words else 0
    
    # Content richness (non-stop words ratio)
    content_words = [word for word in words if word not in stop_words and word.isalpha()]
    content_ratio = len(content_words) / len(words) if words else 0
    
    # POS tag diversity (indicates complex content)
    pos_tags = pos_tag(original_words)
    unique_pos = len(set([tag for _, tag in pos_tags]))
    pos_diversity = unique_pos / len(pos_tags) if pos_tags else 0
    
    # Check for important indicators
    has_numbers = bool(re.search(r'\b\d+\b', text))
    has_caps = bool(re.search(r'\b[A-Z]{2,}\b', text))
    has_dates = bool(re.search(r'\b\d{4}\b|\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', text))
    
    # NEW: Check for proper nouns and topic keywords in this line
    line_proper_nouns = extract_proper_nouns_and_entities(text)
    
    # Count matches with global proper nouns (case-insensitive)
    proper_noun_matches = 0
    for pn in line_proper_nouns:
        if any(pn.lower() in global_pn.lower() or global_pn.lower() in pn.lower() 
               for global_pn in proper_nouns_global):
            proper_noun_matches += 1
    
    # Count matches with topic keywords
    topic_keyword_matches = 0
    text_lower = text.lower()
    for keyword in topic_keywords_global:
        if keyword.lower() in text_lower:
            topic_keyword_matches += 1
    
    # Calculate proper noun density
    proper_noun_density = proper_noun_matches / len(original_words) if original_words else 0
    topic_keyword_density = topic_keyword_matches / len(words) if words else 0
    
    # NEW: Relevance and irrelevance detection
    is_irrelevant = detect_irrelevant_content(text, topic_keywords_global)
    topic_relevance_score = calculate_topic_relevance_score(text, topic_keywords_global, proper_nouns_global)
    
    return {
        'word_count': word_count,
        'sentence_count': sentence_count,
        'avg_word_length': avg_word_length,
        'content_ratio': content_ratio,
        'pos_diversity': pos_diversity,
        'has_numbers': has_numbers,
        'has_caps': has_caps,
        'has_dates': has_dates,
        'proper_noun_matches': proper_noun_matches,
        'topic_keyword_matches': topic_keyword_matches,
        'proper_noun_density': proper_noun_density,
        'topic_keyword_density': topic_keyword_density,
        'has_proper_nouns': proper_noun_matches > 0,
        'has_topic_keywords': topic_keyword_matches > 0,
        'is_irrelevant': is_irrelevant,
        'topic_relevance_score': topic_relevance_score
    }

def extract_lines_with_boxes(page):
    """Enhanced line extraction with better filtering"""
    lines_with_boxes = []
    blocks = page.get_text("dict")["blocks"]
    
    for block in blocks:
        if block["type"] != 0:  # Skip non-text blocks
            continue
            
        for line in block["lines"]:
            line_text = " ".join([span["text"] for span in line["spans"]]).strip()
            
            # Filter out very short lines and headers/footers
            if len(line_text) < 10:  # Minimum meaningful text length
                continue
                
            # Skip likely headers/footers (very short lines at page edges)
            bbox = fitz.Rect(line["bbox"])
            page_height = page.rect.height
            if (bbox.y0 < page_height * 0.1 or bbox.y0 > page_height * 0.9) and len(line_text) < 50:
                continue
                
            lines_with_boxes.append((line_text, bbox))
    
    return lines_with_boxes

def generate_enhanced_summary(text, max_tokens=150):
    """Enhanced summary generation with better parameters"""
    try:
        tokenizer = BartTokenizer.from_pretrained("facebook/bart-large-cnn")
        model = BartForConditionalGeneration.from_pretrained("facebook/bart-large-cnn")
        
        # Better tokenization with overlap handling
        inputs = tokenizer(
            text, 
            return_tensors="pt", 
            max_length=1024, 
            truncation=True,
            padding=True
        )
        
        # Enhanced generation parameters
        summary_ids = model.generate(
            inputs["input_ids"],
            max_length=max_tokens,
            min_length=30,  # Ensure minimum summary length
            num_beams=6,    # More beams for better quality
            length_penalty=1.2,  # Balanced length penalty
            early_stopping=True,
            no_repeat_ngram_size=3,  # Avoid repetition
            do_sample=False
        )
        
        summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    except Exception as e:
        print(f"Summary generation error: {e}")
        # Fallback to extractive summary
        sentences = sent_tokenize(text)
        return '. '.join(sentences[:3]) + '.'

def calculate_multi_similarity_score(line_text, summary_sentences, sentence_model):
    """Calculate similarity using multiple methods and combine them"""
    
    # Method 1: Sentence transformer similarity
    line_sentences = sent_tokenize(line_text)
    if not line_sentences:
        return 0.0
        
    line_embeddings = sentence_model.encode([clean_text(s) for s in line_sentences], convert_to_tensor=True)
    summary_embeddings = sentence_model.encode(summary_sentences, convert_to_tensor=True)
    
    # Get max similarity across all sentence pairs
    cosine_scores = util.cos_sim(line_embeddings, summary_embeddings)
    semantic_score = float(cosine_scores.max())
    
    # Method 2: TF-IDF similarity for keyword matching
    try:
        tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
        all_texts = [line_text] + summary_sentences
        tfidf_matrix = tfidf_vectorizer.fit_transform(all_texts)
        
        # Calculate similarity between line and each summary sentence
        line_tfidf = tfidf_matrix[0]
        summary_tfidf = tfidf_matrix[1:]
        
        tfidf_similarities = cosine_similarity(line_tfidf, summary_tfidf)[0]
        tfidf_score = float(np.max(tfidf_similarities))
    except:
        tfidf_score = 0.0
    
    # Method 3: Keyword overlap score
    line_words = set(word_tokenize(line_text.lower()))
    summary_words = set()
    for sent in summary_sentences:
        summary_words.update(word_tokenize(sent.lower()))
    
    # Remove stop words
    stop_words = set(stopwords.words('english'))
    line_words = line_words - stop_words
    summary_words = summary_words - stop_words
    
    if line_words and summary_words:
        overlap_score = len(line_words.intersection(summary_words)) / len(line_words.union(summary_words))
    else:
        overlap_score = 0.0
    
    # Combine scores with weights
    combined_score = (
        0.5 * semantic_score +      # Primary: semantic similarity
        0.3 * tfidf_score +         # Secondary: keyword importance
        0.2 * overlap_score         # Tertiary: direct overlap
    )
    
    return combined_score

def calculate_adaptive_thresholds(scores, features_list):
    """Calculate adaptive thresholds based on score distribution and content features"""
    scores = np.array(scores)
    
    # Statistical thresholds
    mean_score = np.mean(scores)
    std_score = np.std(scores)
    median_score = np.median(scores)
    
    # Adaptive threshold calculation
    # High threshold: top 20% or 1 std above mean
    high_threshold = max(
        np.percentile(scores, 80),
        mean_score + 0.8 * std_score,
        0.6  # Minimum high threshold
    )
    
    # Medium threshold: above median or 0.3 std above mean
    medium_threshold = max(
        median_score,
        mean_score + 0.3 * std_score,
        0.3  # Minimum medium threshold
    )
    
    # Ensure reasonable separation
    if high_threshold - medium_threshold < 0.1:
        high_threshold = medium_threshold + 0.1
    
    return medium_threshold, high_threshold

def detect_irrelevant_content(text, topic_keywords_global):
    """Detect lines that are clearly irrelevant to the main topic"""
    text_lower = text.lower()
    
    # Common irrelevant patterns for academic documents
    irrelevant_patterns = [
        # Personal opinions/experiences
        r'\bi (like|love|hate|enjoy|prefer|think|believe|feel)\b',
        r'\bmy (favourite|favorite|phone|battery)\b',
        r'\bi went to\b',
        r'\bi really\b',
        
        # Casual/conversational phrases
        r'\bit was fun\b',
        r'\bon fridays?\b',
        r'\blike to stare at\b',
        r'\bimagine shapes\b',
        r'\bright now\b',
        
        # Random facts unrelated to topic
        r'\bsquirrels?\b.*\bnuts?\b',
        r'\bpizza\b',
        r'\bcolour.*green.*spring leaf\b',
        r'\bphone battery.*%\b',
        
        # Overly casual language
        r'\bstuff\b',
        r'\bthings?\b.*\bcool\b',
        r'\byou know\b',
        r'\bguess what\b'
    ]
    
    # Check for irrelevant patterns
    for pattern in irrelevant_patterns:
        if re.search(pattern, text_lower):
            return True
    
    # Check topic relevance - if no topic keywords and very casual language
    has_topic_keywords = any(keyword.lower() in text_lower for keyword in topic_keywords_global)
    
    # Casual indicators
    casual_indicators = [
        'i ', 'my ', 'really', 'like', 'enjoy', 'fun', 'favourite', 'favorite'
    ]
    casual_count = sum(1 for indicator in casual_indicators if indicator in text_lower)
    
    # If no topic relevance and multiple casual indicators
    if not has_topic_keywords and casual_count >= 2:
        return True
        
    return False

def calculate_topic_relevance_score(text, topic_keywords_global, proper_nouns_global):
    """Calculate how relevant the text is to the main topic"""
    text_lower = text.lower()
    words = word_tokenize(text_lower)
    
    if not words:
        return 0.0
    
    # Count topic keyword matches
    topic_matches = sum(1 for keyword in topic_keywords_global 
                       if keyword.lower() in text_lower)
    
    # Count proper noun matches  
    proper_noun_matches = sum(1 for pn in proper_nouns_global 
                            if pn.lower() in text_lower)
    
    # Historical/academic terms that indicate relevance
    academic_terms = [
        'period', 'history', 'political', 'social', 'economic', 'revolution',
        'government', 'society', 'culture', 'movement', 'event', 'century',
        'era', 'regime', 'system', 'war', 'conflict', 'treaty', 'document',
        'declaration', 'constitution', 'law', 'reform', 'change', 'influence'
    ]
    
    academic_matches = sum(1 for term in academic_terms if term in text_lower)
    
    # Calculate relevance score
    total_matches = topic_matches + proper_noun_matches + academic_matches
    relevance_score = total_matches / len(words)
    
    # Boost for direct topic keyword presence
    if topic_matches > 0:
        relevance_score += 0.1
    
    # Boost for proper nouns
    if proper_noun_matches > 0:
        relevance_score += 0.05
        
    return min(relevance_score, 1.0)  # Cap at 1.0

def calculate_content_boost(features):
    """Calculate content-based importance boost"""
    boost = 0.0
    
    # Boost for longer, more substantial content
    if features['word_count'] > 15:
        boost += 0.05
    if features['word_count'] > 25:
        boost += 0.05
        
    # Boost for content richness
    if features['content_ratio'] > 0.6:
        boost += 0.03
        
    # Boost for syntactic diversity
    if features['pos_diversity'] > 0.3:
        boost += 0.03
        
    # Boost for informative elements
    if features['has_numbers']:
        boost += 0.02
    if features['has_dates']:
        boost += 0.02
    if features['has_caps']:
        boost += 0.01
    
    # NEW: Major boost for proper nouns and topic keywords
    if features['has_proper_nouns']:
        # Strong boost based on density of proper nouns
        boost += 0.15 + (features['proper_noun_density'] * 0.2)
        
    if features['has_topic_keywords']:
        # Strong boost based on density of topic keywords
        boost += 0.12 + (features['topic_keyword_density'] * 0.15)
        
    return boost

def enforce_proper_noun_rule(scored_lines, features_list, medium_threshold):
    """Enforce rule: lines with proper nouns/topic keywords cannot be low importance"""
    adjusted_lines = []
    adjustments_made = 0
    irrelevant_blocked = 0
    
    for i, (text, bbox, score) in enumerate(scored_lines):
        features = features_list[i]
        original_score = score
        
        # If line has proper nouns or topic keywords but score is below medium threshold
        if (features['has_proper_nouns'] or features['has_topic_keywords']) and score < medium_threshold:
            # Check if it's irrelevant content - if so, don't boost
            if features['is_irrelevant']:
                irrelevant_blocked += 1
                # Keep original low score for irrelevant content
            else:
                # Boost to at least medium threshold + small margin
                score = max(score, medium_threshold + 0.05)
                adjustments_made += 1
                
                # Additional boost if it has both proper nouns AND topic keywords
                if features['has_proper_nouns'] and features['has_topic_keywords']:
                    score += 0.05
        
        adjusted_lines.append((text, bbox, score))
    
    return adjusted_lines, adjustments_made, irrelevant_blocked

def main():
    if len(sys.argv) >= 3:
        PDF_FILE = sys.argv[1]
        OUTPUT_PDF = sys.argv[2]
        OUTPUT_IMAGE = OUTPUT_PDF.replace('.pdf', '.png')
    else:
        PDF_FILE = "French Revolution.pdf"
        OUTPUT_IMAGE = "enhanced_output-FRENCH.png"
        OUTPUT_PDF = OUTPUT_IMAGE.replace('.png', '.pdf')
    
    try:
        print("Opening PDF and extracting content...")
        doc = fitz.open(PDF_FILE)
        page = doc[0]
        lines_with_boxes = extract_lines_with_boxes(page)
        
        if not lines_with_boxes:
            print("No text lines found in PDF")
            return
            
        print(f"Extracted {len(lines_with_boxes)} text lines")
        
        # Clean and prepare text
        line_texts = [clean_text(line) for line, _ in lines_with_boxes]
        full_text = " ".join(line_texts)
        
        if len(full_text) < 100:
            print("Insufficient text content for analysis")
            return

        print("Extracting proper nouns and topic keywords...")
        # Extract proper nouns and entities from the entire document
        proper_nouns_global = extract_proper_nouns_and_entities(full_text)
        topic_keywords_global = extract_topic_keywords(full_text)
        
        print(f"Found {len(proper_nouns_global)} proper nouns/entities")
        print(f"Found {len(topic_keywords_global)} topic keywords")
        
        # Show some examples
        if proper_nouns_global:
            print(f"Proper nouns sample: {', '.join(proper_nouns_global[:5])}")
        if topic_keywords_global:
            print(f"Topic keywords sample: {', '.join(topic_keywords_global[:5])}")

        print("Generating enhanced summary...")
        summary = generate_enhanced_summary(full_text)
        summary_sentences = sent_tokenize(summary)
        print(f"Summary ready: {len(summary_sentences)} sentences")
        print(f"Summary preview: {summary[:100]}...")

        print("Computing multi-modal similarity scores...")
        sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
        
        scored_lines = []
        features_list = []
        
        for idx, (line_text, bbox) in enumerate(lines_with_boxes):
            # Calculate similarity score
            similarity_score = calculate_multi_similarity_score(
                line_text, summary_sentences, sentence_model
            )
            
            # Calculate content features (now includes proper noun analysis)
            features = calculate_text_features(line_text, proper_nouns_global, topic_keywords_global)
            features_list.append(features)
            
            # Apply content-based boost (now includes proper noun boost)
            content_boost = calculate_content_boost(features)
            final_score = similarity_score + content_boost
            
            scored_lines.append((line_text, bbox, final_score))
            
            if idx % 10 == 0:
                print(f"  Processed {idx+1}/{len(lines_with_boxes)} lines...")

        # Calculate adaptive thresholds
        scores = [score for _, _, score in scored_lines]
        medium_threshold, high_threshold = calculate_adaptive_thresholds(scores, features_list)
        
        print(f"\nInitial Adaptive Thresholds:")
        print(f"  High importance (Green): >= {high_threshold:.3f}")
        print(f"  Medium importance (Yellow): >= {medium_threshold:.3f}")
        print(f"  Low importance: < {medium_threshold:.3f}")

        # NEW: Enforce proper noun rule with irrelevance filtering
        print("Enforcing proper noun/topic keyword rule with irrelevance filtering...")
        scored_lines, adjustments_made, irrelevant_blocked = enforce_proper_noun_rule(scored_lines, features_list, medium_threshold)
        print(f"Adjusted {adjustments_made} lines with proper nouns/topic keywords")
        print(f"Blocked {irrelevant_blocked} irrelevant lines from higher importance")

        # Generate highlighted image
        print("Creating highlighted PDF image...")
        img = convert_from_path(PDF_FILE, dpi=200, first_page=1, last_page=1)[0]
        draw = ImageDraw.Draw(img, "RGBA")
        scale = 200 / 72

        highlight_counts = {'high': 0, 'medium': 0, 'low': 0}
        proper_noun_highlights = {'high': 0, 'medium': 0}
        irrelevant_count = 0
        
        for i, (text, bbox, score) in enumerate(scored_lines):
            features = features_list[i]
            x0, y0, x1, y1 = bbox
            rect = [x0 * scale, y0 * scale, x1 * scale, y1 * scale]
            
            # Track irrelevant content
            if features['is_irrelevant']:
                irrelevant_count += 1
            
            if score >= high_threshold:
                draw.rectangle(rect, fill=(0, 255, 0, 100))      # Green (high importance)
                highlight_counts['high'] += 1
                if features['has_proper_nouns'] or features['has_topic_keywords']:
                    proper_noun_highlights['high'] += 1
            elif score >= medium_threshold:
                draw.rectangle(rect, fill=(255, 255, 0, 80))     # Yellow (medium importance)
                highlight_counts['medium'] += 1
                if features['has_proper_nouns'] or features['has_topic_keywords']:
                    proper_noun_highlights['medium'] += 1
            else:
                highlight_counts['low'] += 1
                # Optional: light red tint for irrelevant content
                if features['is_irrelevant']:
                    draw.rectangle(rect, fill=(255, 200, 200, 40))  # Light red for irrelevant

        img.save(OUTPUT_IMAGE)
        print(f"\nEnhanced output image saved as {OUTPUT_IMAGE}")

        # Save as PDF
        OUTPUT_PDF = OUTPUT_IMAGE.replace('.png', '.pdf')
        rgb_img = img.convert('RGB')
        rgb_img.save(OUTPUT_PDF, "PDF", resolution=200.0)
        print(f"PDF with highlights saved as {OUTPUT_PDF}")

        # Summary statistics
        print(f"\nHighlighting Statistics:")
        print(f"  High importance: {highlight_counts['high']} lines")
        print(f"  Medium importance: {highlight_counts['medium']} lines")
        print(f"  Low importance: {highlight_counts['low']} lines")
        print(f"  Irrelevant content: {irrelevant_count} lines")
        print(f"\nProper Noun/Topic Keyword Lines:")
        print(f"  High: {proper_noun_highlights['high']} lines")
        print(f"  Medium: {proper_noun_highlights['medium']} lines")
        print(f"  Low: 0 lines (enforced rule - unless irrelevant)")

        # Debug output with top lines
        print(f"\nTop 10 Most Important Lines:")
        sorted_lines = sorted(enumerate(scored_lines), key=lambda x: x[1][2], reverse=True)
        
        for i, (original_idx, (text, _, score)) in enumerate(sorted_lines[:10]):
            features = features_list[original_idx]
            
            if score >= high_threshold:
                label = "HIGH"
            elif score >= medium_threshold:
                label = "MEDIUM"
            else:
                label = "LOW"
            
            # Add indicators for proper nouns/keywords and irrelevance
            indicators = []
            if features['has_proper_nouns']:
                indicators.append(f"PN:{features['proper_noun_matches']}")
            if features['has_topic_keywords']:
                indicators.append(f"TK:{features['topic_keyword_matches']}")
            if features['is_irrelevant']:
                indicators.append("IRRELEVANT")
            
            relevance = f"R:{features['topic_relevance_score']:.2f}"
            indicators.append(relevance)
            
            indicator_str = f" [{', '.join(indicators)}]" if indicators else ""
            
            preview = text[:60] + ('...' if len(text) > 60 else '')
            print(f"  {i+1:2d}. [{label}] ({score:.3f}){indicator_str} {preview}")

        # Show examples of irrelevant content that was filtered
        print(f"\nExamples of Irrelevant Content Detected:")
        irrelevant_examples = [(i, text, features_list[i]['topic_relevance_score']) 
                              for i, (text, _, _) in enumerate(scored_lines) 
                              if features_list[i]['is_irrelevant']]
        
        for i, (idx, text, relevance) in enumerate(irrelevant_examples[:5]):
            preview = text[:70] + ('...' if len(text) > 70 else '')
            print(f"  {i+1}. (R:{relevance:.2f}) {preview}")

    except FileNotFoundError:
        print(f"Error: PDF file '{PDF_FILE}' not found")
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()