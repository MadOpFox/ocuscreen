import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import Common "types/common";
import Screening "types/screening";
import AnalysisMixin "mixins/analysis-api";
import ScreeningMixin "mixins/screening-api";
import LlmMixin "mixins/llm-api";









actor {
  // Authorization state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Object storage infrastructure
  include MixinObjectStorage();

  // Screening history state
  let screenings = Map.empty<Common.ScreeningId, Screening.ScreeningRecord>();
  let screeningCounter : [var Nat] = [var 0];

  // Domain mixins
  include AnalysisMixin();
  include ScreeningMixin(accessControlState, screenings, screeningCounter);
  include LlmMixin();
};
