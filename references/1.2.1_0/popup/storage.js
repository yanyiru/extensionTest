function extractSavedGroup(chromeResult) {
    var savedGroups = [];
    if(undefined != chromeResult.tabGroups &&  chromeResult.tabGroups.length > 0) {
        $.each(chromeResult.tabGroups, function(key, value) {
            savedGroups.push(new SavedGroup().init2(value.name, toLinksArray(value.links), value.order))
        });
    }
    return savedGroups;
}

function saveSavedGroups(savedGroups) {

}

function toLinksArray(links) {
    return $.map(links, function (value) {
        return new Link().init1(value.name, value.link, value.icon);
    });
}