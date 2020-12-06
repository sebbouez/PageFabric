/*
This is an example of Extension for PageFabric.
Read docs here: https://github.com/sebbouez/PageFabric/wiki
*/

var cancelCalloutTimer;

var Ideas = {

    addTemplate: function (snd, id) {

        if (snd.getAttribute("disabled") != undefined) {
            return;
        }

        let html = document.getElementById("d" + id).dataset.content;

        PageFabric.Document.AppendPartAsync(html).then(function (partInternalID) {
            // After adding a Part, we get its internal ID
            // so we keep it to let the user rollback for a few moment
            Ideas.showCancelCallout(partInternalID);
        }, function (e) {
            // it failed
        });
    },

    removePart: function (partId) {
        Ideas.hideCancelCallout();

        // Remove a Part from the page using its internal ID that we got when we added it
        PageFabric.Document.RemovePartAsync(partId).then(function () {
            // This method returns nothing when it works
        }, function (e) {
            // should we do something when it failed. For example tell the user that we could not remove the Part.
        });
    },

    hideCancelCallout: function () {
        if (typeof cancelCalloutTimer != "undefined")
            window.clearTimeout(cancelCalloutTimer);

        try {
            document.getElementById("cancelCallout").remove();
        } catch (e) { }
    },

    showCancelCallout: function (partId) {
        Ideas.hideCancelCallout();

        let o = document.createElement("div");
        o.id = "cancelCallout";
        o.className = "cancelCallout";
        o.innerHTML = "<p><strong>Looks good to you?</strong></p><a href='javascript:Ideas.hideCancelCallout();'>Yes</a> <a href='javascript:Ideas.removePart(\"" + partId + "\");'>No, remove</a>";
        document.body.appendChild(o);

        cancelCalloutTimer = window.setTimeout(function () {
            Ideas.hideCancelCallout();
        }, 15000);
    },

    activateButtons: function (data) {
        let buttons = document.querySelectorAll(".appendButton");

        buttons.forEach(button => {
            if (data == null) {
                button.setAttribute("disabled", "disabled");
            }
            else {
                button.removeAttribute("disabled");
            }
        });
    },

    getItems: function (filterTag) {

        document.getElementById("content").innerHTML = "<p style='margin:15px;'><img src='loading.gif' />&nbsp;Please wait we're looking for great renderings...</p>";

        let urlQuery = "https://extensions.getpagefabric.com/ideas/getIdeas/" + filterTag;

        fetch(urlQuery)
            .then((response) => {
                return response.json();
            })
            .then((data) => {

                document.getElementById("content").innerHTML = "";

                if (data.length == 0) {
                    document.getElementById("content").innerHTML = "<p style='margin:15px;'>We found nothing.<br/><a href='javascript:Ideas.getItems(\"all\");'>Show all Ideas</a>.</p>";
                    return;
                }

                for (let i = 0; i < data.length; i++) {
                    let o = document.createElement("div");
                    o.className = "tplItem";
                    o.id = "d" + data[i].Id;

                    let s = "<p><strong>" + data[i].Title + "</strong></p>";
                    s += "<img class='thumbnail' src='" + data[i].Image + "'/>";
                    s += "<p><i>" + data[i].Description + "</i></p>";

                    s += "<div class='buttons'><a class='button appendButton' disabled href='javascript:;' onclick='Ideas.addTemplate(this, \"" + data[i].Id + "\")'>Add to document</a></div>";
                    o.innerHTML = s;
                    o.dataset.content = data[i].Content;
                    document.getElementById("content").appendChild(o);
                }

                PageFabric.Document.GetSelectionAsync().then(function (r) {
                    Ideas.activateButtons(r);
                });
            })
            .catch((err) => {
                document.getElementById("content").innerHTML = "<p>Sorry, we had a problem. Please try again later.</p>";
            })
    }

}

async function loaded() {

    if (typeof PageFabric == "undefined") {
        // out of PageFabric extension context
        return;
    }

    // When we start the extension, try to see if there is currently a Website loaded
    // and get its Theme to show only relevant items.
    let siteProperties = await PageFabric.WebSite.GetPropertiesAsync();
    if (siteProperties != null) {
        let siteTheme = siteProperties.Theme;
        Ideas.getItems(siteTheme);
    }

    // When the user loads another Website
    // perform the same action as we did just above.
    PageFabric.WebSite.Loaded(function (siteProperties) {
        // what to do when the user opens a WebSite in PageFabric
        Ideas.getItems(siteProperties.Theme);
    });

    // When the user changes the active page in its workspace
    // update the buttons state.
    PageFabric.Document.SelectionChanged(function (r) {
        Ideas.activateButtons(r);
    });
};

loaded();