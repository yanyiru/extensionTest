

function addSelectTabRowEvent() {
    $(".tab-row").on("click", function () {
        var checkBox = $(this).find(".mdl-checkbox")[0];
        if($(this).find(".mdl-checkbox").hasClass("is-checked")) {
            checkBox.MaterialCheckbox.uncheck();
        } else {
            checkBox.MaterialCheckbox.check();
        }
        $(this).toggleClass("is-selected");
        disableSaveGroupButton();
        checkCheckAllIfAllRowsSelected();
    })
}

function checkCheckAllIfAllRowsSelected() {
    if($("#tab-list .mdl-checkbox:not(.is-checked)").length <= 0) {
        document.querySelector("#select-all-tab-rows").MaterialCheckbox.check();
    } else {
        document.querySelector("#select-all-tab-rows").MaterialCheckbox.uncheck();
    }
}

function selectAllCheckboxInit() {
    $("#select-all-tab-rows input").change(function () {
        var allCheckBox = $(this).parents("table").find("tbody").find(".mdl-checkbox");
        var isChecked = $('#select-all-tab-rows input').is(":checked");

        var notCheckedCheckBox = [];
        allCheckBox.each(function (index, box) {
            if(!$(box).hasClass("is-checked")) {
                notCheckedCheckBox.push(box)
            }
        });
        if(!isChecked) {
            allCheckBox.each(function (index, box) {
                $(box).parents(".tab-row").removeClass("is-selected");
                $(box)[0].MaterialCheckbox.uncheck();
            });
        } else {
            notCheckedCheckBox.forEach(function (box) {
                $(box)[0].MaterialCheckbox.check();
                $(box).parents(".tab-row").addClass("is-selected");
            });
        }
        disableSaveGroupButton()
    })
}

function disableSaveGroupButton() {
    var selectedRows = $(".tab-row.is-selected");
    if (selectedRows.length > 0) {
        $(".save-new-group").removeAttr("disabled")
    } else {
        $(".save-new-group").attr("disabled", "disabled")
    }
}

function getAllOpenChromeTabs(winData) {
    $("#tab-list").empty();

    var links = extractLinksFromWindowData(winData);
    links.forEach(function (link) {
        $("#tab-list")
            .append(getTabTemplate(link));
        componentHandler.upgradeAllRegistered();
    });

    addSelectTabRowEvent();
}

function extractLinksFromWindowData(winData) {
    var links = [];
    for (var i in winData) {
        var winTabs = winData[i].tabs;
        var totTabs = winTabs.length;
        for (var j = 0; j < totTabs; j++) {
            links.push(new Link().init1(winTabs[j].title, winTabs[j].url, winTabs[j].favIconUrl))
        }
    }
    return links;
}

function getTabTemplate(link) {
    var tabRow = $("<tr/>").addClass("tab-row");
    tabRow.append(
        $("<td/>").append(
            $("<lable/>")
                .addClass("mdl-checkbox mdl-js-checkbox mdl-js-ripple-effect")
                .append(
                    $("<input/>")
                        .attr({type: "checkbox"})
                        .addClass("mdl-checkbox__input select-all-tab-rows")
                )
        )
    );
    tabRow.append(
        $("<td/>").append(
            $("<img/>")
                .addClass("tab-image")
                .attr({src: link.icon})
        )
    );
    tabRow.append(
        $("<td/>")
            .attr({title: link.name})
            .addClass("tab-text")
            .text(link.name)
    );
    tabRow.append(
        $("<input/>")
            .attr({hidden: "hidden"})
            .addClass("tab-url")
            .val(link.link)
    );
    // var tabTemplate = $("#tab-template").clone();
    // tabTemplate.removeAttr("id");
    // tabTemplate.removeAttr("hidden");
    // tabTemplate.find(".tab-text").text(link.name);
    // tabTemplate.find(".tab-text").attr("title", link.name);
    // tabTemplate.find(".tab-image").attr("src", link.icon);
    // tabTemplate.find(".tab-url").val(link.link);
    componentHandler.upgradeDom();
    componentHandler.upgradeAllRegistered();
    return tabRow;
}


function filterTabList(text) {
    var $tabs = $(".tab-row").not("#tab-template");
    if (null !== text && text.length > 0) {
        $tabs.each(function () {
            var tabName = $(this).find(".tab-text").text().toLowerCase();
            if (tabName.indexOf(text.toLowerCase()) < 0) {
                $(this).attr("hidden", "hidden");
            } else {
                $(this).removeAttr("hidden");
            }
        })
    } else {
        $("#tabs-filter").val("");
        $tabs.each(function () {
            $(this).removeAttr("hidden");
        })
    }
}
