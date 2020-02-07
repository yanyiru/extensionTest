var currentTabGroupVersion = 1.2
$(document).ready(function () {
    supportOldVersion();
    getAllSavedGroups();
    initSaveNewGroupEvents();
    initMenuEvents();
    initFilters();
    initSortable();

    selectAllCheckboxInit();
    initSearchFilterActivation();
});

function initSearchFilterActivation() {
    $(".search-filter").on("click", function () {
        $(this).find("input").focus()
    })
}

function supportOldVersion() {
    chrome.storage.sync.get("tabGroupVersion", function(result) {
        if(result === undefined || result.length <= 0 || currentTabGroupVersion !== result.tabGroupVersion) {
            refactorChromeStorage();
        }
    })
    setTimeout(function () {

    }, 1000)

}
function refactorChromeStorage() {
    chrome.storage.sync.get("tabGroups", function (result) {
        var newGroups = [];
        $.each(result.tabGroups, function (index, oldGroup) {
            $.each(oldGroup, function (oldGroupName, oldGroupLinks) {
                var links = [];
                oldGroupLinks.split(",").forEach(function (oldLink) {
                    links.push(urlToLinkObject(oldLink))
                });
                newGroups.push(new SavedGroup().init1(oldGroupName, links))
            })
        });
        chrome.storage.largeSync.set({"tabGroups": newGroups}, function () {


        });
    });
    chrome.storage.sync.set({"tabGroupVersion" : currentTabGroupVersion}, function () {
        window.location.reload()
    });
}

function urlToLinkObject(url) {
    var link
    $.ajax({
        async: false,
        url: url,
        complete: function(data) {
            var title = data.responseText.match(/<title[^>]*>([^<]+)<\/title>/)[1].trim()
            var icon =  "http://www.google.com/s2/favicons?domain=" + url;
            link = new Link().init1(title, url, icon)
        }
    });
    return link;
}



function initSortable() {
    var $sortableList = $("#saved-group-list");
    sortable($sortableList, {
        handle: 'div',
        forcePlaceholderSize: true,
        placeholderClass: 'my-placeholder fade'
    })[0].addEventListener('sortupdate', reorderSavedGroupsEventHandelr);
    // $.each($(".saved-group-links-list"), function(index, elem) {
    //     sortable(elem, {
    //         handle: 'div',
    //         forcePlaceholderSize: true,
    //         placeholderClass: 'my-placeholder fade'
    //     })[0].addEventListener('sortupdate', function(e) {
    //         console.log(777)
    //     } );
    // })

}

var reorderSavedGroupsEventHandelr = function(event, ui){
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        var $sortableList = $("#saved-group-list");
        var savedGroups = extractSavedGroup(result);
        var listElements = $sortableList.children();
        var order = 0;
        listElements.each(function (index, elem) {
            var groupName = $(elem).find(".saved-group-name").attr("title");
            $.each(savedGroups, function() {
                if (this.name === groupName) {
                    this.order = order;
                }
            });
            order++;

        });
        chrome.storage.largeSync.set({"tabGroups": savedGroups}, function () {});
    });
};

var reorderSavedGroupsLinksEventHandelr = function(event, ui){
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        var $sortableList = $("#saved-group-list");
        var savedGroups = extractSavedGroup(result);
        var listElements = $sortableList.children();
        var order = 0;
        console.log(666)
        // listElements.each(function (index, elem) {
        //     var linkName = $(elem).find(".link-list-name").attr("title");
        //     $.each(savedGroups, function(group) {
        //         $.each(group.links, function(link) {
        //         if (link.name === linkName) {
        //             link.order = order;
        //         }
        //     });
        //     order++;
        //
        // });
        chrome.storage.largeSync.set({"tabGroups": savedGroups}, function () {});
    });
};

function openChromeTabsTab() {
    toggleTopMenuActionButton();
    toggleMainSectionContent();

    filterSavedGroup("");
    var $savedGroupWrapper = $("#save-new-group-wrapper");
    $("#saved-group-tab").removeClass("is-active");
    $("#chrome-tabs-tab").addClass("is-active");
    $savedGroupWrapper.show();
    chrome.windows.getAll({populate: true}, getAllOpenChromeTabs);
}

function toggleMainSectionContent() {
    $("#saved-group-tab").toggleClass("is-active");
    $("#chrome-tabs-tab").toggleClass("is-active");
}

function toggleTopMenuActionButton() {
    $("#add-group").toggle();
    $("#backward-to-main").toggle()
}

function openSavedGroups() {
    toggleTopMenuActionButton();
    toggleMainSectionContent();

    filterTabList("")
    var $savedGroupWrapper = $("#save-new-group-wrapper");
    getAllSavedGroups();
    $savedGroupWrapper.hide();
    cleanAllActiveFields()
}

function initMenuEvents() {
    $("#add-group").on("click", function () {
        $("#header-text").text("Opened Tabs");;
        openChromeTabsTab();
    });
    $("#backward-to-main").on("click", function () {
        $("#header-text").text("Saved Groups");
        openSavedGroups();
    });
    // $(".mdl-layout__tab").on("click", function () {
    //     var tabName = $(this).attr("tab-name");

        // if (tabName === "SavedTabs") {
        //     getAllSavedGroups();
        //     $savedGroupWrapper.hide();
        //     cleanAllActiveFields()
        // } else {
        //     $savedGroupWrapper.show();
        //     chrome.windows.getAll({populate: true}, getAllOpenChromeTabs);
        // }
    // });
}

function initFilters() {
    $("#saved-group-filter").on("keyup", function () {
        filterSavedGroup($(this).val());
    });
    $("#tabs-filter").on("keyup", function () {
        filterTabList($(this).val());
    })
}

function initSaveNewGroupEvents() {
    $(".save-new-group").on("click", saveNewGroup);
    $(".group-name").on('keydown', function (e) {
        if (e.which == 13) {
            saveNewGroup();
        }
    });
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}
