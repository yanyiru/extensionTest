function getSelectedTabs() {
    var selectedTabsRow = $(".tab-row.is-selected")
        .map(function () {
            var link = new Link().init1(
                $(this).find(".tab-text").attr("title"),
                $(this).find(".tab-url").val(),
                $(this).find(".tab-image").attr("src")
            );
            return link
        });
    return selectedTabsRow;
}

function saveNewGroup() {
    var isAddingNewLink = $("#adding-new-link-to-group").val();
    var links = getSelectedTabs();
    var groupName = $("#group-name").val();
    if(!isGroupNameValid(groupName)) {
        return;
    }
    if(isAddingNewLink === "true") {
        addNewLinkToGroup(links, groupName);
        return;
    }
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        var groupsList = extractSavedGroup(result);
        if(isGroupWithSuchNameExist(groupsList, groupName)) {
            return
        }
        var savedGroup = new SavedGroup().init2(groupName, links, null);
        groupsList.push(savedGroup);
        chrome.storage.largeSync.set({"tabGroups": groupsList}, function () {
            openSavedGroups();
            disableSaveGroupButton();
            window.scrollTo(0, 0);
            $("#header-text").text("Saved Groups");
        })
    })
}

function addNewLinkToGroup(links, groupName) {
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        var groupsList = extractSavedGroup(result);
        groupsList.forEach(function (group) {
            if(group.name === groupName) {
                group.links = $.merge(group.links, links);
            }
        });
        chrome.storage.largeSync.set({"tabGroups": groupsList}, function () {
            openSavedGroups();
            disableSaveGroupButton();
            window.scrollTo(0, 0);
        })
    })
}

function cleanAllActiveFields() {
    var $groupNameInput = $("#group-name");
    $(".tab-row.is-selected").removeClass("is-selected");
    $groupNameInput.val('');
    $groupNameInput.parents(".group-name-wrapper").removeClass("is-dirty");
    $groupNameInput.parents(".group-name-wrapper").removeClass("is-invalid");
    $groupNameInput.parents(".group-name-wrapper").removeClass('is-focused');
    $groupNameInput.removeAttr("disabled", "disabled");
    document.querySelector("#select-all-tab-rows").MaterialCheckbox.uncheck();
    $("#adding-new-link-to-group").val("false");
    disableSaveGroupButton()
}

function isGroupNameValid(groupName) {
    if (isBlank(groupName)) {
        showAddinGroupError("Group name can't be empty");
        return false;
    }
    return true;
}

function isGroupWithSuchNameExist(groupsList, groupName) {
    var exist = false;
    if (groupsList.length > 0) {
        groupsList.forEach(function (group) {
             if(groupName == group.name) {
                 showAddinGroupError("Group with such name already exist");
                 exist = true;
             }
         });
    }
    return exist;
}

function getAllSavedGroups() {
    var $savedGroups = $("#saved-group-list");
    $savedGroups.empty();
    hideNotFound();
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        var savedGroups = extractSavedGroup(result);
        if (savedGroups.length < 1) {
            showNotFound();
        }
        savedGroups.sort(function (a, b) {
            return ((a.order < b.order) ? -1 : ((a.order > b.order) ? 1 : 0))
        });
        savedGroups.forEach(function (group) {
            var groupTeplate = getSavedGroupTemplate(group);

            $savedGroups.append($(groupTeplate));
        });
        initGroupEvents();
        initSortable();
    })

}

function getSavedGroupTemplate(group) {
    var groupTemplate = $("#saved-group-template").clone();
    groupTemplate.removeAttr("id");
    groupTemplate.removeAttr("hidden");
    var $savedGroupName = groupTemplate
        .find(".saved-group-name");
    $savedGroupName.text(group.name);
    $savedGroupName.attr("title", group.name);

    prepareSavedGroupLinksList(groupTemplate.find(".saved-group-links-list"), group.links);
    return groupTemplate;
}


function prepareSavedGroupLinksList($linksListElement, links) {

    jQuery.each(links, function (index, link) {
        var linksListRowTemplate = $("#link-list-row-template").clone();
        linksListRowTemplate.removeAttr("id");
        linksListRowTemplate.removeAttr("hidden");
        linksListRowTemplate.find(".links-list-image").attr("src", link.icon);
        linksListRowTemplate.find(".link-list-name").text(link.name);
        linksListRowTemplate.find(".link-list-name").attr("title", link.link);
        linksListRowTemplate.find(".link-list-name").attr("href", link.link);

        $linksListElement.append(linksListRowTemplate)
    });

}

function showNotFound() {
    $("#SavedTabs").find(".search-filter").hide();
    $(".not-found").show();
}

function hideNotFound() {
    $("#SavedTabs").find(".search-filter").show();
    $(".not-found").hide();
}

function initGroupEvents() {
    initRemoveGroupEvent();
    initSaveGroupEvent();
    initShowLinksListEvent();
    initRemoveFromLinkListEvent();
    initAddNewLinkToGroupButton();
}

function initShowLinksListEvent() {
    $('.saved-group-wrapper').on('click', function (event) {
        var clickedElement = event.target;
        if($(clickedElement).hasClass("saved-group-options") || $(clickedElement).hasClass("saved-group-open-in-new")
            || $(clickedElement).hasClass("link-list-row") || $(clickedElement).hasClass("link-list-name-wrap")
            || $(clickedElement).hasClass("link-list-remove") || $(clickedElement).hasClass("links-list-image")) {
            return;
        }
        var $linkList = $(this).find(".saved-group-links-list");

        var $linkListArrow = $(this).find(".saved-group-link-list-arrow:visible");
        if ($linkListArrow.hasClass("expand")) {
            $linkListArrow.parents(".collapse-expand-wrapper").find(".collapse-wrapper").show();
            $linkListArrow.parents(".expand-wrapper").hide();
            $linkList.show(300);
        } else {
            $linkListArrow.parents(".collapse-expand-wrapper").find(".expand-wrapper").show();
            $linkListArrow.parents(".collapse-wrapper").hide();
            $linkList.hide(100)
        }
        componentHandler.upgradeDom();
    });
}

function showLinksList(savedGroup) {

}

function hideLinksList(savedGroup) {

}

function initAddNewLinkToGroupButton() {
    $(".add-new-link").on("click", function () {
        openChromeTabsTab()
        var $groupNameInput =  $("#group-name");
        var groupName = $(this).parents(".saved-group-wrapper").find(".saved-group-name").attr("title");
        $groupNameInput.attr("disabled", "disabled");
        $groupNameInput.val(groupName).parent().addClass('is-focused');
        $("#adding-new-link-to-group").val("true")
    })
}

function initRemoveFromLinkListEvent() {
    $('.link-list-remove').on("click", function () {
        var currentRow = $($(this).parents(".link-list-row"));
        var groupRow = $(this).parents(".saved-group-wrapper");
        var groupName = groupRow.find(".saved-group-name").attr("title");
        currentRow.hide(100, function () {
            if (!groupRow.find(".link-list-row").is(":visible")) {
                groupRow.hide(100);
                removeGroup(groupName, groupRow)
            }
        });
        var url = currentRow.find("a").attr("href");
        removeOneLinkFromSavedGroup( url);
    })
}

function removeOneLinkFromSavedGroup(removeLink) {
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        var newGroupsList = [];
        var savedGroups = extractSavedGroup(result);
        savedGroups.forEach(function (group) {
            group.links = group.links.filter(function(el) {
                return el.link !== removeLink;
            });
            newGroupsList.push(group)
        });
        chrome.storage.largeSync.set({"tabGroups": newGroupsList}, function () {
            if ($("#saved-group-list .saved-group:visible").length <= 0 && $("#saved-group-filter").val().length <= 0) {
                showNotFound();
            }
        });

    })
}

function showAddinGroupError(text) {
    var $addGroupNameWrapper = $("#save-new-group-wrapper").find(".group-name-wrapper");
    var $addGroupNameErrorField = $($addGroupNameWrapper).find(".mdl-textfield__error");
    $addGroupNameErrorField.text(text);
    $addGroupNameWrapper.addClass("is-invalid")
}

function initRemoveGroupEvent() {
    $(".saved-group-remove").on("click", function (event) {
        var $removedRow = $(this).parents(".saved-group-wrapper");
        var groupName = $removedRow.find(".saved-group-name").text();

        removeGroup(groupName, $removedRow)
    })
}

function removeGroup(groupName, $removedRow) {
    chrome.storage.largeSync.get(["tabGroups"], function (result) {
        var newGroupsList = [];
        var groupsList = extractSavedGroup(result);
        groupsList.forEach(function (group) {
            if(group.name !== groupName) {
                newGroupsList.push(group)
            }
        });
        chrome.storage.largeSync.set({"tabGroups": newGroupsList}, function () {
            $removedRow.hide(100, function () {
                if ($("#saved-group-list .saved-group:visible").length <= 0 && $("#saved-group-filter").val().length <= 0) {
                    showNotFound();
                }
            });
        });
    })
}

var windowObjectReference;

function initSaveGroupEvent() {
    $(".saved-group-open").on("click", function (event) {
        var inNewWindow = false;
        if($(event.target).hasClass("saved-group-open-in-new")) {
            inNewWindow = true;
        }
        var $savedGroup = $(this).parents(".saved-group");
        chrome.storage.largeSync.get(["tabGroups"], function (result) {
            var groupName = $savedGroup.find(".saved-group-name").text();
            var groupsList = extractSavedGroup(result);
            groupsList.forEach(function (group) {
                if (group.name === groupName) {
                    if(inNewWindow) {
                        chrome.windows.create({height: 768, width: 1024}, function (newWindow) {
                            chrome.tabs.remove(newWindow.tabs[0].id);
                        });
                        group.links.forEach(function (link) {
                            windowObjectReference = window.open(link.link);
                        });
                    } else {
                        group.links.forEach(function (link) {
                            chrome.tabs.create({
                                url: link.link
                            });
                        });

                    }
                    return;
                }
            })
        })
        componentHandler.upgradeDom();

    })
}

function filterSavedGroup(text) {
    var $savedGroups = $(".saved-group").not("#saved-group-template");
    if (null != text && text.length > 0) {
        $savedGroups.each(function () {
            var groupName = $(this).find(".saved-group-name").text().toLowerCase();
            if (groupName.indexOf(text.toLowerCase()) < 0) {
                $(this).attr("hidden", "hidden");
            } else {
                $(this).removeAttr("hidden");
            }
        })
    } else {
        $("#saved-group-filter").val("");
        $savedGroups.each(function () {
            $(this).removeAttr("hidden");
        })
    }
}