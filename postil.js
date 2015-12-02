var Packages = new Mongo.Collection("packages");


if (Meteor.isClient) {
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
    Template.body.events({
        "click .btn_add": function () {
            $('#modal1').openModal();
        },
        "click .btn_save": function () {
            $('#modal1').closeModal();
            Meteor.call('addPackage', $("#package_id").val(), $("#package_descr").val());
        }
    });
    Template.packages.helpers({
        packages: function () {
            return Packages.find({});
        }
    });
    Template.package.helpers({
        tracking: function () {
            return ReactiveMethod.call("trackPackages", this.id);
        }
    });
    Template.package.events({
        "click .btn_delete": function () {
            Meteor.call('deletePackage', this.id);
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        var repl = new RegExp("<br><br>.*");
        Meteor.methods({
            trackPackages: function (pid) {
                if (!Meteor.userId()) {
                    throw new Meteor.Error("not-authorized");
                }
                try {
                    var result = HTTP.get("http://www.israelpost.co.il/itemtrace.nsf/trackandtraceJSON?openagent&_=1448904969237&lang=HE&itemcode=" + pid + "&sKod2=");
                    var data = JSON.parse(result.content)["itemcodeinfo"];
                    return data.replace(repl, "");
                } catch (_error) {
                    console.log(_error);
                    throw new Meteor.Error("No Result", "Failed to fetch...");
                }
            },
            addPackage: function (id, descr) {
                if (!Meteor.userId()) {
                    throw new Meteor.Error("not-authorized");
                }
                Packages.insert({
                    description: descr,
                    id: id,
                    createdAt: new Date(),            // current time
                    owner: Meteor.userId(),           // _id of logged in user
                    username: Meteor.user().username  // username of logged in user
                });

            },
            deletePackage: function (id) {
                if (!Meteor.userId()) {
                    throw new Meteor.Error("not-authorized");
                }
                Packages.remove({id: id, owner: Meteor.userId()});
            }
        });
    });
}
