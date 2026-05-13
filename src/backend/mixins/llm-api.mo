import OutCall "mo:caffeineai-http-outcalls/outcall";
import Analysis "../types/analysis";
import LLM "../lib/llm";
import Text "mo:core/Text";

mixin () {
  /// Required transform callback for IC HTTP outcalls — do not remove.
  public query func transform(
    input : OutCall.TransformationInput
  ) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  /// Calls an external LLM API and returns a plain-language summary of the conditions.
  public shared func generateSummary(
    conditions : [Analysis.ConditionResult]
  ) : async Text {
    let prompt = LLM.buildPrompt(conditions);
    let requestBody =
      "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"" #
      escapeJsonString(prompt) #
      "\"}],\"max_tokens\":256,\"temperature\":0.3}";

    let headers : [OutCall.Header] = [
      { name = "Content-Type"; value = "application/json" },
      { name = "Authorization"; value = "Bearer OPENAI_API_KEY" },
    ];

    try {
      let raw = await OutCall.httpPostRequest(
        "https://api.openai.com/v1/chat/completions",
        headers,
        requestBody,
        transform,
      );
      let parsed = LLM.parseResponse(raw);
      if (parsed == "" or parsed == raw) {
        "AI summary unavailable. Please review the numeric scores above.";
      } else {
        parsed;
      };
    } catch (_) {
      "AI summary unavailable. Please review the numeric scores above.";
    };
  };

  // --- Private helper ---

  /// Escapes a Motoko Text for safe embedding inside a JSON string literal.
  func escapeJsonString(t : Text) : Text {
    var result = "";
    for (c in t.chars()) {
      let escaped : Text = switch c {
        case '\"' "\\\"";
        case '\\' "\\\\";
        case '\n' "\\n";
        case '\t' "\\t";
        case '\r' "\\r";
        case _ Text.fromChar(c);
      };
      result := result # escaped;
    };
    result;
  };
};
