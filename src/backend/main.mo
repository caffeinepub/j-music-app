import Map "mo:core/Map";
import Blob "mo:core/Blob";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  public type UserProfile = {
    name : Text;
  };

  public type SongName = Text;
  public type CompositionId = Nat;

  public type NewComposition = {
    name : Text;
    composerData : Blob;
  };

  type CompositionEntry = {
    id : Nat;
    name : Text;
    composerData : Blob;
  };

  let compositions = Map.empty<Principal, List.List<CompositionEntry>>();
  var nextCompositionId = 0;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Composition Functions
  public shared ({ caller }) func saveComposition(name : SongName, composerData : Blob) : async CompositionId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save compositions");
    };

    let userCompositions = switch (compositions.get(caller)) {
      case (null) {
        let newList = List.empty<CompositionEntry>();
        compositions.add(caller, newList);
        newList;
      };
      case (?existing) { existing };
    };

    let compositionId = nextCompositionId;
    nextCompositionId += 1;

    userCompositions.add({
      id = compositionId;
      name;
      composerData;
    });

    compositionId;
  };

  public query ({ caller }) func listCompositions() : async [(SongName, CompositionId)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list compositions");
    };

    switch (compositions.get(caller)) {
      case (null) { [] };
      case (?userCompositions) {
        userCompositions.toArray().map(func(entry) { (entry.name, entry.id) });
      };
    };
  };

  public query ({ caller }) func loadComposition(compositionId : CompositionId) : async Blob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can load compositions");
    };

    switch (compositions.get(caller)) {
      case (null) {
        Runtime.trap("No compositions found for this user");
      };
      case (?userCompositions) {
        let result = userCompositions.find(func(entry) { entry.id == compositionId });
        switch (result) {
          case (null) {
            Runtime.trap("Composition not found");
          };
          case (?entry) { entry.composerData };
        };
      };
    };
  };

  public shared ({ caller }) func deleteComposition(compositionId : CompositionId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete compositions");
    };

    switch (compositions.get(caller)) {
      case (null) {
        Runtime.trap("No compositions found for this user");
      };
      case (?userCompositions) {
        let filteredList = userCompositions.filter(func(entry) { entry.id != compositionId });
        compositions.add(caller, filteredList);
      };
    };
  };
};
