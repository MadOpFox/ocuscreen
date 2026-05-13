import Runtime "mo:core/Runtime";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Analysis "../types/analysis";
import Screening "../types/screening";
import ScreeningLib "../lib/screening";

mixin (
  accessControlState : AccessControl.AccessControlState,
  screenings : Map.Map<Common.ScreeningId, Screening.ScreeningRecord>,
  screeningCounter : [var Nat],
) {
  /// Saves a screening result for the authenticated caller. Returns the new screeningId.
  public shared ({ caller }) func saveScreening(
    result : Analysis.AnalysisResult,
    imageStorageId : Text,
  ) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to save a screening");
    };
    let counter = screeningCounter[0];
    screeningCounter[0] := counter + 1;
    let record = ScreeningLib.newRecord(caller, result, imageStorageId, Time.now(), counter);
    screenings.add(record.id, record);
    record.id;
  };

  /// Returns all screening records belonging to the authenticated caller.
  public query ({ caller }) func getScreeningHistory() : async [Screening.ScreeningRecord] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view screening history");
    };
    ScreeningLib.getRecordsForUser(screenings, caller);
  };

  /// Returns a single screening record by ID (caller must own it).
  public query ({ caller }) func getScreening(
    screeningId : Text
  ) : async ?Screening.ScreeningRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to view a screening");
    };
    switch (screenings.get(screeningId)) {
      case (?record) {
        if (Principal.equal(record.userId, caller)) ?record else null;
      };
      case null null;
    };
  };

  /// Deletes a screening record by ID (caller must own it). Returns true if deleted.
  public shared ({ caller }) func deleteScreening(
    screeningId : Text
  ) : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to delete a screening");
    };
    switch (screenings.get(screeningId)) {
      case (?record) {
        if (Principal.equal(record.userId, caller)) {
          screenings.remove(screeningId);
          true;
        } else {
          false;
        };
      };
      case null false;
    };
  };

  /// Clears all screening history for the authenticated caller. Returns true on success.
  public shared ({ caller }) func clearHistory() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Must be logged in to clear history");
    };
    let toDelete = screenings.entries().filter(
      func((_, r) : (Common.ScreeningId, Screening.ScreeningRecord)) : Bool {
        Principal.equal(r.userId, caller)
      }
    ).map(
      func((k, _) : (Common.ScreeningId, Screening.ScreeningRecord)) : Common.ScreeningId { k }
    ).toArray();
    for (id in toDelete.values()) {
      screenings.remove(id);
    };
    true;
  };
};
