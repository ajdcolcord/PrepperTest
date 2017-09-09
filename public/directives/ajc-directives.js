(function() {
    angular
        .module("ajcDirectives", [])
        .directive("ajcSortable", ajcSortable)
        .directive('ngEnter', ngEnter);

    function ajcSortable() {
        function linker(scope, element, attributes) {
            var data = scope.data;
            var startIndex = -1;
            var endIndex = -1;

            $(element)
                .sortable({
                    axis: 'y',
                    handle: '.ajc-ticket-handle',
                    
                    start: function(event, ui) {
                        startIndex = ui.item.index();
                    },
                    stop: function (event, ui) {
                        endIndex = ui.item.index();
                        var sortedElement = scope.data.splice(startIndex, 1)[0];
                        scope.data.splice(endIndex, 0, sortedElement);
                        scope.$apply();
                        scope.reorder({start: startIndex, end: endIndex});
                    }
                });
        }
        return {
            scope: {
                data: "=",
                reorder: "&sorted"
            },
            link: linker
        }
    }

    function ngEnter() {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if(event.which === 13) {
                    scope.$apply(function (){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    }
})();