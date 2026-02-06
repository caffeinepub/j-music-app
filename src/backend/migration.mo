import Map "mo:core/Map";
import Blob "mo:core/Blob";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  // Old composition type
  type OldComposition = Blob;

  type OldCompositionEntry = {
    id : Nat;
    name : Text;
    data : OldComposition;
  };

  type OldActor = {
    compositions : Map.Map<Principal, List.List<OldCompositionEntry>>;
    nextCompositionId : Nat;
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  type NewCompositionEntry = {
    id : Nat;
    name : Text;
    composerData : Blob;
  };

  type NewActor = {
    compositions : Map.Map<Principal, List.List<NewCompositionEntry>>;
    nextCompositionId : Nat;
    accessControlState : AccessControl.AccessControlState;
    userProfiles : Map.Map<Principal, { name : Text }>;
  };

  public func run(old : OldActor) : NewActor {
    let newCompositions = old.compositions.map<Principal, List.List<OldCompositionEntry>, List.List<NewCompositionEntry>>(
      func(
        _principal,
        oldList,
      ) {
        oldList.map<OldCompositionEntry, NewCompositionEntry>(
          func(entry) { { entry with composerData = entry.data } }
        );
      }
    );

    {
      old with
      compositions = newCompositions
    };
  };
};
