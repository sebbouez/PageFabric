/*
This is an example of Extension for PageFabric.
Read docs here: https://github.com/sebbouez/PageFabric/wiki
*/

var PexelsExt = {

    hideActions: function () {
        $("footer").hide();
    },

    showActions: function (value) {
        let text = " selected items";
        if (value <= 1)
            text = " selected item";

        $("#labelItemsCount").text(value + text);
        $("footer").show();
    },

    downloadAssets: function () {

        // Prepare the array of assets to import
        let assets = new Array();
        $(".picItemThumbnail.active").each(function (i) {
            let assetUrl = $(this).attr("data-url");
            assets.push(assetUrl);
        });

        if (assets.length == 0) {
            return;
        }

        // Show a message to wait for the user to accept to download the assets
        PexelsExt.showApprovalMessage();

        // call the method and give the array as parameter
        PageFabric.WebSite.TryImportAssetsAsync(assets).then(function (r) {
            PexelsExt.removeApprovalMessage();
        }, function (r) {
            // manage the error
        });

    },

    showApprovalMessage: function () {
        $("body").append("<div class='messageOverlay'><span>Waiting for your approval...</span></div>");
    },

    removeApprovalMessage: function () {
        $(".messageOverlay").remove();
    },

    showMoreOptions: function () {
        $("#moreOptions").show();
        $("#linkMoreOptions").hide();
    },

    hideMoreOptions: function () {
        $("#moreOptions").hide();
        $("#linkMoreOptions").show();
    },

    initWebsiteColors: function (siteProperties) {
        $("#websiteColors").empty();
        $("#websiteColors").append("<span class=\"searchColorTag\" data-value=\"" + siteProperties.Palette.themeLight + "\" style=\"background:" + siteProperties.Palette.themeLight + "\"></span>&nbsp;");
        $("#websiteColors").append("<span class=\"searchColorTag\" data-value=\"" + siteProperties.Palette.themePrimary + "\" style=\"background:" + siteProperties.Palette.themePrimary + "\"></span>&nbsp;");
        $("#websiteColors").append("<span class=\"searchColorTag\" data-value=\"" + siteProperties.Palette.themeSecondary + "\" style=\"background:" + siteProperties.Palette.themeSecondary + "\"></span>&nbsp;");
        $("#websiteColors").append("<span class=\"searchColorTag\" data-value=\"" + siteProperties.Palette.themeTertiary + "\" style=\"background:" + siteProperties.Palette.themeTertiary + "\"></span>&nbsp;");
        $("#websiteColors").append("<span class=\"searchColorTag\" data-value=\"" + siteProperties.Palette.themeDark + "\" style=\"background:" + siteProperties.Palette.themeDark + "\"></span>&nbsp;");
        $("#websiteColors").append("<span class=\"searchColorTag\" data-value=\"" + siteProperties.Palette.themeDarkAlt + "\" style=\"background:" + siteProperties.Palette.themeDarkAlt + "\"></span>&nbsp;");
    },


    search: function () {
        let query = document.getElementById("query").value;
        if (query == "") {
            query = "showcase";
        }

        document.getElementById("content").innerHTML = "<p style='margin:15px;'><img src='loading.gif' />&nbsp;Please wait...</p>";
        let urlQuery = "./search?q=" + query;

        if ($(".searchColorTag.active").length == 1) {
            let color = $(".searchColorTag.active").data("value");
            urlQuery += "&c=" + color.replace("#", "%23");
        }

        $.getJSON(urlQuery, function (data) {
            $("#content").empty();

            if (query == "showcase") {
                $("#content").append("<p>Our selection:</p>");
            }

            if (data.total_results == 0) {
                $("#content").append("<p>Sorry, we found nothing for this keyword. Try with another word.</p>");
            }
            else {
                $.each(data.photos, function (i, hit) {
                    let picItem = "<div class='picItemThumbnail' title=\"By " + hit.photographer + " on Pexels\" data-url='" + hit.src.large + "'><div class='picItemThumbnailInner' style=\"background-image:url(" + hit.src.medium + ");\"></div><div class='picItemThumbnailTag'>By " + hit.photographer + " on Pexels</div></div>";
                    $("#content").append(picItem);
                });
            }
        });

    }
}

async function loaded() {

    if (typeof PageFabric == "undefined") {
        // out of PageFabric extension context
        return;
    }

    // This extension uses the "TryImportAssetsAsync" method
    // which requires that a website is currently loaded in PageFabric
    // so a blocking message is visible by default.
    // This method will remove the message if a website is loaded at startup.
    let siteProperties = await PageFabric.WebSite.GetPropertiesAsync();
    if (siteProperties != null) {
        $("#siteAlert").remove();
        PexelsExt.initWebsiteColors(siteProperties);
    }

    // This method will remove the blocking message if a website is loaded after the extension is started.
    PageFabric.WebSite.Loaded(function (siteProperties) {
        // what to do when the user opens a WebSite in PageFabric
        $("#siteAlert").remove();
        PexelsExt.initWebsiteColors(siteProperties);
    });

    PexelsExt.search();
};

$(document).ready(function () {

    loaded();

    $(document).on("keydown", function (e) {
        if (e.keyCode == 13) {
            PexelsExt.search();
        }
    });

    $(document).on("click", ".searchColorTag", function () {
        let isActive = $(this).hasClass("active");
        $(".searchColorTag.active").removeClass("active");

        if (isActive)
            $(this).removeClass("active");
        else
            $(this).addClass("active");
    });

    $(document).on("click", ".picItemThumbnail", function () {
        $(this).toggleClass("active");

        let selectionCount = $(".picItemThumbnail.active").length;
        if (selectionCount > 0) {
            PexelsExt.showActions(selectionCount);
        } else {
            PexelsExt.hideActions();
        }
    });

});