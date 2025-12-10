"""
PowerStream ML Microservice
Provides content recommendation and ranking APIs
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
PORT = int(os.getenv("ML_SERVICE_PORT", 5200))
DEBUG = os.getenv("ML_DEBUG", "false").lower() == "true"


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint"""
    return jsonify({
        "status": "ok",
        "service": "powerstream-ml",
        "version": "1.0.0"
    })


@app.route("/rank", methods=["POST"])
def rank_content():
    """
    Rank content for a user's feed
    
    Request body:
    {
        "user_id": "string",
        "content_ids": ["id1", "id2", ...],  # Optional - if not provided, returns trending
        "limit": 20,
        "offset": 0
    }
    
    Response:
    {
        "recommendations": [
            {"id": "content_id", "score": 0.95, "reason": "trending"},
            ...
        ],
        "model_version": "v1.0.0"
    }
    """
    data = request.get_json() or {}
    
    user_id = data.get("user_id")
    content_ids = data.get("content_ids", [])
    limit = min(data.get("limit", 20), 100)
    offset = data.get("offset", 0)
    
    # TODO: Implement actual ML ranking
    # For now, return mock ranked content
    
    if content_ids:
        # Score provided content
        recommendations = [
            {
                "id": cid,
                "score": 1.0 - (i * 0.1),  # Mock decreasing scores
                "reason": "engagement" if i < 3 else "freshness"
            }
            for i, cid in enumerate(content_ids[offset:offset + limit])
        ]
    else:
        # Return placeholder for trending
        recommendations = [
            {
                "id": f"trending_{i}",
                "score": 1.0 - (i * 0.05),
                "reason": "trending"
            }
            for i in range(limit)
        ]
    
    return jsonify({
        "recommendations": recommendations,
        "model_version": "v1.0.0-stub",
        "note": "Using stub implementation. Full ML model coming soon."
    })


@app.route("/similar", methods=["POST"])
def find_similar():
    """
    Find similar content to a given item
    
    Request body:
    {
        "content_id": "string",
        "content_type": "post|reel|story",
        "limit": 10
    }
    """
    data = request.get_json() or {}
    
    content_id = data.get("content_id")
    content_type = data.get("content_type", "post")
    limit = min(data.get("limit", 10), 50)
    
    # TODO: Implement content similarity
    # For now, return mock similar content
    
    similar = [
        {
            "id": f"similar_{i}",
            "similarity": 0.9 - (i * 0.1),
            "content_type": content_type
        }
        for i in range(limit)
    ]
    
    return jsonify({
        "source_id": content_id,
        "similar": similar,
        "model_version": "v1.0.0-stub"
    })


@app.route("/user/preferences", methods=["POST"])
def analyze_user_preferences():
    """
    Analyze user preferences based on activity
    
    Request body:
    {
        "user_id": "string",
        "activity": [
            {"type": "like", "content_id": "...", "timestamp": "..."},
            ...
        ]
    }
    """
    data = request.get_json() or {}
    
    user_id = data.get("user_id")
    activity = data.get("activity", [])
    
    # TODO: Implement preference analysis
    # For now, return mock preferences
    
    return jsonify({
        "user_id": user_id,
        "preferences": {
            "content_types": {"reel": 0.6, "post": 0.3, "story": 0.1},
            "engagement_style": "passive_consumer",  # or active_creator, social_butterfly
            "peak_hours": [19, 20, 21],
            "interests": ["music", "entertainment", "sports"]
        },
        "confidence": 0.7,
        "model_version": "v1.0.0-stub"
    })


@app.route("/moderate", methods=["POST"])
def moderate_content():
    """
    Content moderation check
    
    Request body:
    {
        "content_type": "text|image|video",
        "content": "string or url"
    }
    """
    data = request.get_json() or {}
    
    content_type = data.get("content_type", "text")
    content = data.get("content", "")
    
    # TODO: Implement content moderation
    # For now, return safe by default
    
    return jsonify({
        "safe": True,
        "categories": {
            "spam": 0.01,
            "hate": 0.01,
            "violence": 0.01,
            "adult": 0.01,
        },
        "action": "approve",
        "model_version": "v1.0.0-stub"
    })


if __name__ == "__main__":
    print(f"🧠 PowerStream ML Service starting on port {PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)




