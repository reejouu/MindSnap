#!/usr/bin/env python3
"""
Test script for the battle quiz agent
"""

import json
import sys
import os

# Add the agent directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'agent'))

from quiz_battle_agent import generate_battle_quiz

def test_battle_quiz():
    """Test the battle quiz generation with different topics"""
    
    test_cases = [
        {
            "topic": "JavaScript Fundamentals",
            "difficulty": "intermediate",
            "num_questions": 5
        },
        {
            "topic": "Python Programming",
            "difficulty": "intermediate", 
            "num_questions": 3
        },
        {
            "topic": "Web Development",
            "difficulty": "easy",
            "num_questions": 4
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n{'='*50}")
        print(f"Test Case {i}: {test_case['topic']}")
        print(f"{'='*50}")
        
        try:
            quiz = generate_battle_quiz(
                topic=test_case["topic"],
                difficulty=test_case["difficulty"],
                num_questions=test_case["num_questions"]
            )
            
            print(f"✅ Successfully generated quiz for '{test_case['topic']}'")
            print(f"📊 Quiz details:")
            print(f"   - Topic: {quiz.get('topic', 'N/A')}")
            print(f"   - Difficulty: {quiz.get('difficulty', 'N/A')}")
            print(f"   - Total Questions: {quiz.get('total_questions', 'N/A')}")
            print(f"   - Questions Generated: {len(quiz.get('quiz', []))}")
            
            # Validate quiz structure
            if 'quiz' in quiz and isinstance(quiz['quiz'], list):
                for j, question in enumerate(quiz['quiz'], 1):
                    print(f"\n   Question {j}:")
                    print(f"   - ID: {question.get('id', 'N/A')}")
                    print(f"   - Question: {question.get('question', 'N/A')[:100]}...")
                    print(f"   - Options: {len(question.get('options', []))} options")
                    print(f"   - Correct Answer: {question.get('correct_answer', 'N/A')}")
                    if 'explanation' in question:
                        print(f"   - Has Explanation: Yes")
            
        except Exception as e:
            print(f"❌ Error generating quiz for '{test_case['topic']}': {str(e)}")
            continue

def test_json_output():
    """Test the JSON output format that the API expects"""
    
    print(f"\n{'='*50}")
    print("Testing JSON Output Format")
    print(f"{'='*50}")
    
    test_data = {
        "topic": "React Hooks",
        "difficulty": "intermediate",
        "num_questions": 2
    }
    
    try:
        quiz = generate_battle_quiz(**test_data)
        
        # Test JSON serialization
        json_output = json.dumps(quiz, ensure_ascii=False, indent=2)
        print("✅ JSON serialization successful")
        print("📄 Sample JSON output:")
        print(json_output[:500] + "..." if len(json_output) > 500 else json_output)
        
        # Test JSON deserialization
        parsed_quiz = json.loads(json_output)
        print("✅ JSON deserialization successful")
        
        # Validate structure
        required_fields = ['quiz', 'topic', 'difficulty', 'total_questions']
        for field in required_fields:
            if field in parsed_quiz:
                print(f"✅ Field '{field}' present")
            else:
                print(f"❌ Field '{field}' missing")
                
    except Exception as e:
        print(f"❌ Error in JSON test: {str(e)}")

if __name__ == "__main__":
    print("🧪 Testing Battle Quiz Agent")
    print("Make sure you have set the GOOGLE_API_KEY environment variable")
    
    # Check if API key is set
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ GOOGLE_API_KEY environment variable not set")
        print("Please set it before running the test")
        sys.exit(1)
    
    test_battle_quiz()
    test_json_output()
    
    print(f"\n{'='*50}")
    print("✅ All tests completed!")
    print(f"{'='*50}") 