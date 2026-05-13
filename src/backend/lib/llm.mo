import Analysis "../types/analysis";
import Float "mo:core/Float";
import Text "mo:core/Text";
import Array "mo:core/Array";

module {
  /// Builds the prompt string for the LLM from condition results.
  public func buildPrompt(conditions : [Analysis.ConditionResult]) : Text {
    var jaundiceScore = "N/A";
    var jaundiceRisk = "N/A";
    var jaundiceExpl = "N/A";
    var anemiaScore = "N/A";
    var anemiaRisk = "N/A";
    var anemiaExpl = "N/A";
    var arcusScore = "N/A";
    var arcusRisk = "N/A";
    var arcusExpl = "N/A";

    for (c in conditions.vals()) {
      let scoreText = c.score.toText();
      if (c.condition == "jaundice") {
        jaundiceScore := scoreText;
        jaundiceRisk := c.riskLevel;
        jaundiceExpl := c.explanation;
      } else if (c.condition == "anemia") {
        anemiaScore := scoreText;
        anemiaRisk := c.riskLevel;
        anemiaExpl := c.explanation;
      } else if (c.condition == "cornealArcus") {
        arcusScore := scoreText;
        arcusRisk := c.riskLevel;
        arcusExpl := c.explanation;
      };
    };

    "You are a medical research tool assistant. The following are automated (non-diagnostic) eye screening results:\n" #
    "- Jaundice risk: " # jaundiceScore # "/100 (" # jaundiceRisk # ") — " # jaundiceExpl # "\n" #
    "- Anemia risk: " # anemiaScore # "/100 (" # anemiaRisk # ") — " # anemiaExpl # "\n" #
    "- Corneal Arcus risk: " # arcusScore # "/100 (" # arcusRisk # ") — " # arcusExpl # "\n" #
    "Please provide a 2-3 sentence plain-language summary of these findings for a research screening report. Emphasize that these results are not a medical diagnosis and that the user should consult a healthcare professional.";
  };

  /// Parses the raw LLM response JSON into a plain-language summary text.
  /// Extracts the "content" field from a standard OpenAI-compatible response body.
  public func parseResponse(rawResponse : Text) : Text {
    switch (extractJsonField(rawResponse, "content")) {
      case (?content) { content };
      case null {
        switch (extractJsonField(rawResponse, "text")) {
          case (?text) { text };
          case null { rawResponse };
        };
      };
    };
  };

  // --- Private helpers ---

  /// Converts a Text to a char array for indexed access.
  func toCharArray(t : Text) : [Char] {
    t.chars().toArray();
  };

  /// Finds the first occurrence of needle in haystack, returns the starting index.
  func textIndexOf(haystack : Text, needle : Text) : ?Nat {
    let hSize = haystack.size();
    let nSize = needle.size();
    if (nSize > hSize or nSize == 0) return null;
    let hArr = toCharArray(haystack);
    let nArr = toCharArray(needle);
    var i = 0;
    label search loop {
      if (i + nSize > hSize) break search;
      var j = 0;
      var match = true;
      label inner loop {
        if (j >= nSize) break inner;
        if (hArr[i + j] != nArr[j]) { match := false; break inner };
        j += 1;
      };
      if (match) return ?i;
      i += 1;
    };
    null;
  };

  /// Returns a substring of t starting at char index `start`.
  func textFrom(t : Text, start : Nat) : Text {
    let arr = toCharArray(t);
    let size = arr.size();
    if (start >= size) return "";
    var result = "";
    var i = start;
    while (i < size) {
      result := result # Text.fromChar(arr[i]);
      i += 1;
    };
    result;
  };

  /// Extracts the string value of a JSON field key, unescaping the result.
  func extractJsonField(json : Text, key : Text) : ?Text {
    let pattern = "\"" # key # "\":\"";
    switch (textIndexOf(json, pattern)) {
      case null null;
      case (?pos) {
        let afterKey = textFrom(json, pos + pattern.size());
        ?readJsonString(afterKey);
      };
    };
  };

  /// Reads characters from t until an unescaped closing `"`, handling JSON escapes.
  func readJsonString(t : Text) : Text {
    let arr = toCharArray(t);
    let size = arr.size();
    var result = "";
    var i = 0;
    var escaped = false;
    while (i < size) {
      let c = arr[i];
      if (escaped) {
        let ch : Text = switch c {
          case 'n' "\n";
          case 't' "\t";
          case 'r' "\r";
          case '\"' "\"";
          case '\\' "\\";
          case _ Text.fromChar(c);
        };
        result := result # ch;
        escaped := false;
      } else if (c == '\\') {
        escaped := true;
      } else if (c == '\"') {
        return result;
      } else {
        result := result # Text.fromChar(c);
      };
      i += 1;
    };
    result;
  };
};
