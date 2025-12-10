// backend/brain/cognitiveMap.js

const cognitiveMap = {
  mapIntentToActions(intent) {
    switch (intent.type) {
      case "stream_content":
        return ["validate_stream", "initiate_broadcast"];
      case "post_update":
        return ["validate_post", "publish_to_feed"];
      default:
        return ["log_unrecognized_intent"];
    }
  }
};

export default cognitiveMap;
