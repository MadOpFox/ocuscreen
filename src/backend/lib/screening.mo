import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Common "../types/common";
import Analysis "../types/analysis";
import Screening "../types/screening";

module {
  /// Creates a new ScreeningRecord with a generated ID.
  public func newRecord(
    userId : Principal,
    result : Analysis.AnalysisResult,
    imageStorageId : Text,
    timestamp : Int,
    counter : Nat,
  ) : Screening.ScreeningRecord {
    let id = "scr-" # counter.toText() # "-" # timestamp.toText();
    {
      id;
      userId;
      timestamp;
      result;
      imageStorageId;
    };
  };

  /// Returns all screening records for a given user principal, newest first, max 50.
  public func getRecordsForUser(
    screenings : Map.Map<Common.ScreeningId, Screening.ScreeningRecord>,
    userId : Principal,
  ) : [Screening.ScreeningRecord] {
    // Collect all records for this user
    let userRecords = screenings.entries().filter(
      func((_, r) : (Common.ScreeningId, Screening.ScreeningRecord)) : Bool {
        Principal.equal(r.userId, userId)
      }
    ).map(
      func((_, r) : (Common.ScreeningId, Screening.ScreeningRecord)) : Screening.ScreeningRecord { r }
    ).toArray();

    // Sort newest first (descending timestamp)
    let sorted = userRecords.sort(
      func(a : Screening.ScreeningRecord, b : Screening.ScreeningRecord) : { #less; #equal; #greater } {
        // Reverse order: larger timestamp = newer = comes first
        Int.compare(b.timestamp, a.timestamp)
      }
    );

    // Cap at 50
    if (sorted.size() <= 50) sorted
    else sorted.sliceToArray(0, 50);
  };
};
