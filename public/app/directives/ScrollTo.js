app.directive('scrollOnClick', function () {
    return {
        restrict: "A",
        link: function(scope,$elm,attrs){
            var idToScollTo = attrs.href;
            $elm.on("click", function () {
                var $target;
                if (idToScollTo)
                    $target = $(idToScollTo);
                else
                    $target = $elm;
                $("body").animate({scrollTop:$target.offset().top},"slow");
            });
        }
    };
});


app.service('ScrollTo', ['$window', function ($window) {
    this.idOrName = function (idOrName, offset) {
        var document = $window.document;
        if (!idOrName) {
            $window.scrollTo(0, 0);
        }

        var el = document.getElementById(idOrName);
        if (!el) {
            el = document.getElementsByName(idOrName);
            if (el && el.length)
                el = el[0];
            else
                el = null;
        }
        if (el) {
            if (offset) {
                var top = $(el).offset().top - offset;
                window.scrollTo(0, top);
            }
            else
                el.scrollIntoView();
        }
    }

}]);

