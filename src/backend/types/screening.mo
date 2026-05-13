import Common "common";
import Analysis "analysis";

module {
  public type ScreeningRecord = {
    id : Common.ScreeningId;
    userId : Principal;
    timestamp : Common.Timestamp;
    result : Analysis.AnalysisResult;
    imageStorageId : Text;
  };
};
