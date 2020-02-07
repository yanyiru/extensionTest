var Link = function () {};
Link.prototype.init1 = function (name, link, icon) {
    this.name = name;
    this.link = link;
    this.icon = icon;
    return this;
};


var SavedGroup = function () {};
SavedGroup.prototype.init1 = function (name, links) {
    this.name = name;
    this.links = links;
    this.order = null;
    return this;
};
SavedGroup.prototype.init2 = function (name, links, order) {
    this.name = name;
    this.links = links;
    this.order = order;
    return this;
};