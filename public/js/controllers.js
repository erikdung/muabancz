'use strict';

/* Controllers */

var app = angular.module('myApp.controllers', [])

app.controller('HomeCtrl', function($scope) {
    $scope.$on('$stateChangeSuccess',
            function() {
                /* ================================
                 ===  BACKGROUND SLIDER        ====
                 ================================= */
//                $.vegas('slideshow', {
//                    delay: 20000,
//                    backgrounds: [
//                        {src: 'images/backgrounds/bg1.jpg'}
//                    ]
//                });

                // nastaveni full-screen uvodni stranky
                var height = $(window).height();
                $("#intro").height(height);
                $(".bottom-message-section").css("margin-top", height * 0.30);
                $("#home-div-full").backstretch("../css/bg1_copy.jpg");

            });
});

app.controller('LoginCtrl', function($scope, $http, $state) {
    $scope.login = function() {
        var data = {
            username: $scope.phone,
            password: $scope.password
        }
        console.log(data);
        $http.post("/login", data).success(
                function(data, status) {
                    $state.go("admin");
                }
        )
                .error(
                function(data, status) {
                    $scope.errorMessage = "WrongLogin";
                }
        );
    }
});

app.controller('RegisterCtrl', function($scope, $http, $state) {
    $scope.register = function() {
        $("#submit").button('loading');
        var data = {
            phone: $scope.phone,
            name: $scope.name,
            surname: $scope.surname,
            password: $scope.password,
            address: $scope.address,
            psc: $scope.psc,
            city: $scope.city
        };
        console.log(data);
        $http.post("/create-seller", data).success(
                function(data, status) {
                    console.log(data);
                    $("#submit").button('reset');
                    $state.go("home.registered");
                }
        ).error(
                function(data, status) {
                    console.log(data);
                });
    }

    $scope.checkPhoneNumber = function() {
        var data = {
            phone: $scope.phone
        }
        $http.post("/check-phone-number", data).success(
                function(data, status) {
                    if (data.rowCount > 0) {
                        $scope.phoneUsed = true;
                    }
                    else {
                        $scope.phoneUsed = false;
                    }
                })
                .error(
                function(data, status) {
                    console.log(data);
                });
    }
});

app.controller('AdminCtrl', function($scope) {
});

app.controller('AddproductCtrl', function($scope, $http, $fileUploader) {
    $http.get("/get-categories")
            .success(
            function(data) {
                $scope.cats = data.rows;
            })
            .error(
            function(data) {
                $scope.errMess = "ConnectFail";
            });


    $scope.getSubCats = function(id) {
        $scope.subcats = [];
        $http.get("/get-subcategories/" + id)
                .success(
                function(data) {
                    $scope.subcats = data.rows;
                })
                .error(
                function(data) {
                    $scope.errMess = "ConnectFail";
                });
    }


    var uploader = $scope.uploader = $fileUploader.create({
        scope: $scope,
        url: '/add-image'
    });


    // ADDING FILTERS

    // Images only
    uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
        var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
        type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    });

    uploader.bind('error', function(event, xhr, item, response) {
        console.info('Error', xhr, item, response);
    });

    $scope.add = function() {
        var data = {
            title: $scope.title,
            description: $scope.description,
            price: $scope.price,
            count: $scope.count,
            category: $scope.category,
            subcategory: $scope.subcategory
        };
        $http.post("/create-good", data).success(
                function(data) {
                    console.log(data);
                    uploader.uploadAll();
                }
        )
                .error(
                function(data) {
                    console.log(data);
                }
        );
    }
});


app.controller('ProductlistCtrl', function($scope, $http) {
    $http.get("/get-goods-by-user")
            .success(function(data) {
        $scope.goods = data.rows;
    })
            .error(function(data) {
        console.log(1);
        $scope.errMess = "ConnectFail";
    });

    $scope.deactivate = function(id, key) {
        $scope.errMess = "";
        var data = {goodId: id};
        $http.post("/deactivate-good", data)
                .success(function(data) {
            $scope.goods[key].state = 0;
        })
                .error(function(data) {
            console.log(data);
            $scope.errMess = "ConnectFail";
        });
    }

    $scope.activate = function(id, key) {
        $scope.errMess = "";
        var data = {goodId: id};
        $http.post("/activate-good", data)
                .success(function(data) {
            $scope.goods[key].state = 1;
        })
                .error(function(data) {
            console.log(data);
            $scope.errMess = "ConnectFail";
        });
    }
});

app.controller('ProductdetailCtrl', function($scope, $http, $stateParams) {
    $scope.$on('$stateChangeSuccess',
            function() {
                $('.fancybox').fancybox();
            });


    $scope.goodID = $stateParams.id;
    $http.get("/get-good-detail/" + $stateParams.id)
            .success(function(data) {
        $scope.good = data.rows[0];
    })
            .error(function(data) {
        console.log("error");
        $scope.errMess = "ConnectFail";
    });
    $http.get("/get-good-images/" + $stateParams.id)
            .success(function(data) {
        $scope.images = data.rows;

        $scope.imagePrev = [];
        for (var i = 0; i < data.rowCount / 3; i++) {
            var row = [];
            row.push(data.rows[3 * i]);
            row.push(data.rows[3 * i + 1]);
            row.push(data.rows[3 * i + 2]);
            $scope.imagePrev.push(row);
        }

        $scope.image1 = "uploads/fullsize/" + $stateParams.id + "/" + data.rows[0].title;
    })
            .error(function(data) {
        console.log("error");
        $scope.errMess = "ConnectFail";
    });

    $scope.changeImage = function(imageName) {
        $scope.image1 = "uploads/fullsize/" + $stateParams.id + "/" + imageName;
    }
});

app.controller('SellCtrl', function($scope, $translate, $http, $state) {
    $scope.checkLogged = function() {
        $http.get("/loggedin").success(
                function(data, status) {
                    if (data !== "0") {
                        $state.go("admin");
                    }
                }
        )
                .error(
                function(data, status) {
                    $scope.errorMessage = "Wrong phone number or password";
                }
        );
    }
    $scope.checkLogged();
});

app.controller('AdminmainCtrl', function($scope) {
});


app.controller('AdmincategoriesCtrl', function($scope, $http) {
    $scope.addCat = function() {
        $scope.loading = true;
        $scope.errorMess = "";
        var data = {
            catTitle: $scope.catTitle,
            catDescription: $scope.catDesc
        }
        $http.post("/create-category", data).success(
                function(data, status) {
                    console.log(data);
                    $scope.cats.push(data.rows[0]);
                    $scope.loading = false;
                    $scope.catTitle = "";
                    $scope.catDesc = "";
                })
                .error(
                function(data, status) {
                    console.log(data);
                    $scope.loading = false;
                    $scope.errorMess = "Nelze se připojit na server";
                });
    }

    $scope.addSubcat = function() {
        $scope.errorMess = "";
        var data = {
            subcatTitle: $scope.subcatTitle,
            subcatDesc: $scope.subcatDesc,
            subcatCategory: $scope.subcatCategory

        }
        $http.post("/create-subcategory", data).success(
                function(data, status) {
                    console.log(data);

                    $scope.subcatTitle = "";
                    $scope.subcatDesc = "";
                })
                .error(
                function(data, status) {
                    console.log(data);
                    $scope.errorMess = "Nelze se připojit na server";
                });
    }

    $scope.getCats = function() {
        $scope.loading = true;
        $scope.errorMess = "";
        $scope.cats = [];
        $http.get("/get-categories").success(
                function(data) {
                    $scope.cats = data.rows;
                    $scope.loading = false;
                })
                .error(
                function(data) {
                    $scope.loading = true;
                    $scope.errorMess = "Nelze se připojit na server";
                });
    }

    $scope.getCats();

    $scope.deactivateCat = function(id, key) {
        $scope.cats[key].state = 0;
        $scope.loading = true;
        $scope.errorMess = "";
        var data = {id: id};
        $http.post("/deactivate-category", data)
                .success(
                function(data) {
                    $scope.loading = false;
                }
        )
                .error(
                function(data) {
                    $scope.loading = false;
                    $scope.errorMess = "Nelze se připojit na server";
                });
    }

    $scope.activateCat = function(id, key) {
        $scope.cats[key].state = 1;

        $scope.loading = true;
        $scope.errorMess = "";
        var data = {id: id};
        $http.post("/activate-category", data)
                .success(
                function(data) {
                    $scope.loading = false;
                }
        )
                .error(
                function(data) {
                    $scope.loading = false;
                    $scope.errorMess = "Nelze se připojit na server";
                });
    }

});

app.controller('AdmincatdetailCtrl', function($scope, $stateParams, $http) {
    var id = $stateParams.id;

    $http.get("/get-category-detail/" + id).success(
            function(data) {
                $scope.data = data.rows[0];
            })
            .error(
            function(data) {
                console.log(data);
            });

    $http.get("/get-subcategories/" + id).success(
            function(data) {
                $scope.subcats = data.rows;
            })
            .error(
            function(data) {
                console.log(data);
            });

    $scope.deactivateCat = function(id, key) {
        $scope.subcats[key].state = 0;
        $scope.loading = true;
        $scope.errorMess = "";
        var data = {id: id};
        $http.post("/deactivate-subcategory", data)
                .success(
                function(data) {
                    $scope.loading = false;
                }
        )
                .error(
                function(data) {
                    $scope.loading = false;
                    $scope.errorMess = "Nelze se připojit na server";
                });
    }

    $scope.activateCat = function(id, key) {
        $scope.subcats[key].state = 1;

        $scope.loading = true;
        $scope.errorMess = "";
        var data = {id: id};
        $http.post("/activate-subcategory", data)
                .success(
                function(data) {
                    $scope.loading = false;
                }
        )
                .error(
                function(data) {
                    $scope.loading = false;
                    $scope.errorMess = "Nelze se připojit na server";
                });
    }
});

app.controller("BuyCtrl", function($scope, $http, $stateParams) {

    $(function() {
        $("#slider-range").slider({
            range: true,
            min: 0,
            max: 100000,
            values: [0, 50000],
            slide: function(event, ui) {
                $("#amount").val(ui.values[ 0 ] + "Kč - " + ui.values[ 1 ] + "Kč");
            }
        });
        console.log(1);
        $("#amount").val($("#slider-range").slider("values", 0) +
                " Kč - " + $("#slider-range").slider("values", 1) + "Kč");
    });

    $scope.categoryOpen = false;
    $scope.filterOpen = false;

    $scope.category = function() {
        if (!$scope.categoryOpen)
            $scope.categoryOpen = true;
        else
            $scope.categoryOpen = false;
    }

    $scope.filter = function() {
        if (!$scope.filterOpen)
            $scope.filterOpen = true;
        else
            $scope.filterOpen = false;
    }

    if (!$stateParams.page)
        $scope.page = 1;
    else
        $scope.page = parseInt($stateParams.page);

    if ($scope.page > 0) {
        $http.get("/get-goods/" + ($scope.page - 1))
                .success(function(data) {
            $scope.goods = [];
            for (var i = 0; i < 3; i++) {
                var row = [];
                for (var e = 0; e < 3; e++) {
                    if (data.rows[(e + i * 3)])
                        row.push(data.rows[(e + i * 3)]);
                }
                $scope.goods.push(row);
            }
        })
                .error(function(data) {
            console.log("error");
        });
    }

    $http.get("/get-row-count")
            .success(
            function(data) {
                $scope.rowCount = data.rowCount;
                if (isInt($scope.rowCount / 9)) {
                    $scope.last = $scope.rowCount / 9;
                }
                else {
                    $scope.last = Math.floor($scope.rowCount / 9 + 1);
                }
                $scope.paginator = [];
                for (var i = $scope.page - 2; i <= $scope.last; i++) {
                    if (i > 0 && $scope.paginator.length < 10) {
                        $scope.paginator.push(i);
                    }
                }
                $scope.xspaginator = [];
                for (var i = $scope.page - 2; i <= $scope.last; i++) {
                    if (i > 0 && $scope.xspaginator.length < 5) {
                        $scope.xspaginator.push(i);
                    }
                }
            })
            .error(
            function(err) {
                console.log("error");
            });

});

app.controller("QuicksellCtrl", function($scope, $http, $fileUploader, $state) {
    $http.get("/get-categories")
            .success(
            function(data) {
                $scope.cats = data.rows;
            })
            .error(
            function(data) {
                $scope.errMess = "ConnectFail";
            });


    $scope.getSubCats = function(id) {
        $scope.subcats = [];
        $http.get("/get-subcategories/" + id)
                .success(
                function(data) {
                    $scope.subcats = data.rows;
                })
                .error(
                function(data) {
                    $scope.errMess = "ConnectFail";
                });
    }


    var uploader = $scope.uploader = $fileUploader.create({
        scope: $scope,
        url: '/add-image'
    });


    // ADDING FILTERS

    // Images only
    uploader.filters.push(function(item /*{File|HTMLInputElement}*/) {
        var type = uploader.isHTML5 ? item.type : '/' + item.value.slice(item.value.lastIndexOf('.') + 1);
        type = '|' + type.toLowerCase().slice(type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    });

    uploader.bind('error', function(event, xhr, item, response) {
        console.info('Error', xhr, item, response);
    });

    $scope.add = function() {
        var data = {
            title: $scope.title.escape(),
            description: $scope.description.escape(),
            price: $scope.price,
            count: $scope.count,
            category: $scope.category,
            subcategory: $scope.subcategory,
            phone: $scope.phone
        };
        $http.post("/create-good-anonym", data).success(
                function(data) {
                    uploader.uploadAll();
                    var goodID = data.rows[0].id;
                    if ($scope.files) {
                        uploader.bind('completeall', function(event, items) {
                            $state.go("main.detail", {id: goodID});
                        });
                    }
                    else {
                        $state.go("main.detail", {id: goodID});
                    }
                }
        )
                .error(
                function(data) {
                    console.log(data);
                }
        );
    }
});

app.controller("MaindetailCtrl", function($scope, $http, $stateParams, $state) {
    if ($stateParams.id) {
        $scope.goodID = $stateParams.id;
        $http.get("/get-good-detail-public/" + $stateParams.id)
                .success(function(data) {
            $scope.good = data.rows[0];
        })
                .error(function(err) {
            console.log(err);
        });


        $http.get("/get-good-images/" + $stateParams.id)
                .success(function(data) {
            $scope.images = data.rows;
            if ($scope.images.length > 0) {
                $scope.imagePrev = [];
                for (var i = 0; i < data.rowCount / 3; i++) {
                    var row = [];
                    row.push(data.rows[3 * i]);
                    row.push(data.rows[3 * i + 1]);
                    row.push(data.rows[3 * i + 2]);
                    $scope.imagePrev.push(row);
                }

                $scope.image1 = "uploads/fullsize/" + $stateParams.id + "/" + data.rows[0].title;
            }
        })
                .error(function(data) {
            console.log("error");
            $scope.errMess = "ConnectFail";
        });

    }
    else {
        console.log(2);
        $state.go("main.buy");
    }

    $scope.$on('$stateChangeSuccess',
            function() {
                $('.fancybox').fancybox();
            });
});

String.prototype.escape = function()
{
    //no need to do (str+'') anymore because 'this' can only be a string
    return this.replace(/'/g, "''")
}

function isInt(str)
{
    var i = parseInt(str);
    if (isNaN(i))
        return false;
    i = i.toString();
    if (i != str)
        return false;
    return true;
}