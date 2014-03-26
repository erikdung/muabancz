var bcrypt = require('bcrypt')
        , SALT_WORK_FACTOR = 10
        , pg = require("pg");
//        , conString = "postgres://dunglexuan:@localhost:5432/muabancz";
        
var conString = process.env.DATABASE_URL;

exports.createDB = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query('CREATE TABLE IF NOT EXISTS Users (\n\
        id SERIAL NOT NULL,\n\
        phone numeric(9) NOT NULL UNIQUE,\n\
        name text NOT NULL,\n\
        surname text NOT NULL,\n\
        password text NOT NULL,\n\
        address text NOT NULL,\n\
        psc numeric(5),\n\
        role varchar(10) NOT NULL,\n\
        city text NOT NULL,\n\
        state integer NOT NULL,\n\
        CONSTRAINT key PRIMARY KEY (id)\n\
        ); ',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(1);
                });

        client.query('CREATE TABLE IF NOT EXISTS Goods (\n\
	id SERIAL NOT NULL,\n\
	title text NOT NULL,\n\
	description text NOT NULL,\n\
	price integer NOT NULL,\n\
	state integer NOT NULL,\n\
	datetime timestamp NOT NULL,\n\
	CONSTRAINT keyGoods PRIMARY KEY (id)); ',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(2);
                });
        client.query('CREATE TABLE IF NOT EXISTS Userhasgood (\n\
	id SERIAL NOT NULL,\n\
	count integer NOT NULL,\n\
	id_Users integer references Users(id),\n\
	id_Goods integer references Goods(id),\n\
        CONSTRAINT keyUserhasgood PRIMARY KEY (id)); ',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(3);
                });

        client.query('CREATE TABLE IF NOT EXISTS Categories (\n\
	id SERIAL NOT NULL,\n\
	title text NOT NULL,\n\
	description text,\n\
	state integer NOT NULL,\n\
	CONSTRAINT keyCategories PRIMARY KEY (id)\n\
        );',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(4);
                });

        client.query('CREATE TABLE IF NOT EXISTS Subcategories (\n\
	id SERIAL NOT NULL,\n\
	title text NOT NULL,\n\
	description text,\n\
	state integer NOT NULL,\n\
	id_Categories integer NOT NULL REFERENCES Categories(id),\n\
        CONSTRAINT keySubcategories PRIMARY KEY (id)\n\
        );',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(5);
                });

        client.query('CREATE TABLE IF NOT EXISTS Cathasgoods(\n\
	id SERIAL NOT NULL,\n\
	id_Goods integer REFERENCES Goods(id),\n\
	id_Categories integer REFERENCES Categories(id),\n\
        CONSTRAINT keyCathasgoods PRIMARY KEY (id));',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(6);
                });

        client.query('CREATE TABLE IF NOT EXISTS Subcathasgoods(\n\
	id SERIAL NOT NULL,\n\
	id_Goods integer REFERENCES Goods(id),\n\
	id_Subcategories integer REFERENCES Subcategories(id),\n\
        CONSTRAINT keySubcathasgoods PRIMARY KEY (id));',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(6);
                });

        client.query('CREATE TABLE IF NOT EXISTS Anonymsellers (\n\
	id SERIAL NOT NULL,\n\
	phone numeric(9) NOT NULL,\n\
        count integer NOT NULL,\n\
	state integer NOT NULL,\n\
        id_Goods integer UNIQUE REFERENCES Goods(id),\n\
	CONSTRAINT keyAnonym PRIMARY KEY (id)\n\
        );',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(7);
                });

        client.query('CREATE TABLE IF NOT EXISTS Gooddetailshow (\n\
	id SERIAL NOT NULL,\n\
	count integer NOT NULL,\n\
	id_Goods integer UNIQUE REFERENCES Goods(id),\n\
	CONSTRAINT keyGooddetailshow PRIMARY KEY (id)\n\
        );',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(8);
                });

        client.query('CREATE TABLE IF NOT EXISTS Goodshowed (\n\
	id SERIAL NOT NULL,\n\
	count integer NOT NULL,\n\
	id_Goods integer UNIQUE REFERENCES Goods(id),\n\
	CONSTRAINT keyGoodshowed PRIMARY KEY (id)\n\
        );',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(9);
                });


        client.query('CREATE TABLE IF NOT EXISTS Ads (\n\
	id SERIAL NOT NULL,\n\
	header text NOT NULL,\n\
	body text,\n\
	footer text,\n\
	frequency integer NOT NULL,\n\
	state integer NOT NULL,\n\
	CONSTRAINT keyAds PRIMARY KEY (id)\n\
        );',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(10);
                });

        client.query('CREATE TABLE IF NOT EXISTS Images(\n\
	id SERIAL NOT NULL,\n\
	title text NOT NULL,\n\
	state integer NOT NULL,\n\
	id_Goods integer REFERENCES Goods(id),\n\
	id_Ads integer REFERENCES Ads(id),\n\
	CONSTRAINT keyImages PRIMARY KEY (id)\n\
        );',
                function(err, result) {
                    done();
                    if (err)
                        return console.error(err);
                    console.log(11);
                });

    });
}

exports.createSeller = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                client.query("INSERT INTO Users (phone, name, surname, password, address, psc, role, city, state) \n\
        VALUES(\n\
        " + req.body.phone + ",\n\
        '" + req.body.name + "',\n\
        '" + req.body.surname + "',\n\
        '" + hash + "',\n\
        '" + req.body.address + "',\n\
        " + req.body.psc + ",\n\
        'seller',\n\
        '" + req.body.city + "',\n\
        0); ",
                        function(err, result) {
                            done();
                            if (err) {
                                return console.log(err);
                            }
                            else {
                                client.end();
                                res.send(result);
                            }
                        });
            });
        });
    });
}

exports.checkPhoneNumber = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query('SELECT * FROM Users WHERE phone = ' + req.body.phone + '; ',
                function(err, result) {
                    done();
                    if (err)
                        res.send(err);
                    res.send(result);
                });
    });
}

// goods queries

// create good
exports.createGood = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("INSERT INTO Goods (title, description, price, state, datetime) \n\
        VALUES(\n\
        '" + req.body.title + "',\n\
        '" + req.body.description + "',\n\
        " + req.body.price + ",\n\
        1,'now') RETURNING id; ",
                function(err, result) {
                    done();
                    if (err) {
                        return console.log(err);
                    }
                    else {

                        req.session.goodId = result.rows[0].id;
                        client.query("INSERT INTO Userhasgood (count, id_Users, id_Goods) \n\
                        VALUES (\n\
                        " + req.body.count + ",\n\
                        " + req.user.id + ",\n\
                        " + result.rows[0].id + ");", function(err, resultIntro) {
                            if (err) {
                                return console.log(err);
                            }
                            else {
                            }
                        });
                        client.query("INSERT INTO Cathasgoods (id_Goods, id_Categories) \n\
                        VALUES (\n\
                        " + result.rows[0].id + ",\n\
                        " + req.body.category + ");", function(err, resultA) {
                            if (err) {
                                return console.log(err);
                            }
                            else {
                            }
                        });
                        if (req.body.subcategory) {

                            client.query("INSERT INTO Subcathasgoods (id_Goods, id_Subcategories) \n\
                        VALUES (\n\
                        " + result.rows[0].id + ",\n\
                        " + req.body.subcategory + ");", function(err, resultB) {
                                if (err) {
                                    return console.log(err);
                                }
                                else {
                                    client.end();
                                }
                            });
                        }
                        res.send(result);
                    }
                });
    });
}

exports.createGoodAnonym = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("INSERT INTO Goods (title, description, price, state, datetime) \n\
        VALUES(\n\
        '" + req.body.title + "',\n\
        '" + req.body.description + "',\n\
        " + req.body.price + ",\n\
        1, 'now') RETURNING id; ",
                function(err, result) {
                    done();
                    if (err) {
                        return console.log(err);
                    }
                    else {

                        req.session.goodId = result.rows[0].id;
                        client.query("INSERT INTO Anonymsellers (phone, count, state, id_Goods) \n\
                        VALUES (\n\
                        " + req.body.phone + ",\n\
                        " + req.body.count + ",\n\
                        0,\n\
                        " + result.rows[0].id + ");", function(err, resultIntro) {
                            if (err)
                                return console.log(err);
                        });
                        client.query("INSERT INTO Cathasgoods (id_Goods, id_Categories) \n\
                        VALUES (\n\
                        " + result.rows[0].id + ",\n\
                        " + req.body.category + ");", function(err, resultA) {
                            if (err)
                                return console.log(err);
                        });
                        if (req.body.subcategory) {

                            client.query("INSERT INTO Subcathasgoods (id_Goods, id_Subcategories) \n\
                        VALUES (\n\
                        " + result.rows[0].id + ",\n\
                        " + req.body.subcategory + ");", function(err, resultB) {
                                if (err)
                                    return console.log(err);
                                client.end();
                            });
                        }
                        res.send(result);
                    }
                });
    });
}

// get good by signed user id
exports.getGoodsByUser = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT * FROM Goods g, Userhasgood u \n\
                      WHERE (g.id = u.id_Goods) AND (id_Users = " + req.user.id + ");",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);

                })
    });
};

exports.getGoods = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT *, g.title AS gtitle, \n\
                      (SELECT title FROM Images WHERE id_Goods = g.id LIMIT 1) AS ititle \n\
                      FROM Goods g WHERE g.state = 1 \n\
                      ORDER BY datetime OFFSET " + 9 * req.params.page + " LIMIT 9",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);

                })
    });
}

exports.getRowCount = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT * FROM Goods WHERE state = 1;",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);
                })
    });
}

// activate good
exports.activateGood = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("UPDATE Goods SET state = 1 WHERE id = " + req.body.goodId + ";",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);
                })
    });
};

// deactivate good
exports.deactivateGood = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("UPDATE Goods SET state = 0 WHERE id = " + req.body.goodId + ";",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);
                })
    });
};

// good detail
exports.goodDetail = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT *, \n\
                        (SELECT title FROM Cathasgoods g, Categories c WHERE g.id_Categories = c.id AND g.id_Goods = " + req.params.id + ") AS category,\n\
                        (SELECT title FROM Subcathasgoods g, Subcategories c WHERE g.id_Subcategories = c.id AND g.id_Goods = " + req.params.id + ") AS subcategory \n\
                        FROM Goods g, Userhasgood u \n\
                        WHERE g.id = u.id_Goods \n\
                        AND g.id = " + req.params.id + ";",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);
                })
    });
};

exports.goodDetailPublic = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT *, \n\
                        (SELECT title FROM Cathasgoods g, Categories c WHERE g.id_Categories = c.id AND g.id_Goods = " + req.params.id + ") AS category,\n\
                        (SELECT title FROM Subcathasgoods g, Subcategories c WHERE g.id_Subcategories = c.id AND g.id_Goods = " + req.params.id + ") AS subcategory \n\
                        FROM Goods g WHERE g.id = " + req.params.id + ";",
        function(err, result) {
            done();
            if (err) return console.log(err);
            res.send(result);
        })
    });
}


exports.goodImages = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT * FROM Images WHERE id_Goods = " + req.params.id + ";",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);
                })
    });
};


// category and subcategory queries
exports.createCategory = function(req, res) {
    var desc = "";
    if (req.body.catDescription)
        desc = req.body.catDescription.addSlashes();
    pg.connect(conString, function(err, client, done) {
        client.query("INSERT INTO Categories (title, description, state) \n\
                    VALUES ($1, $2, $3) RETURNING id, title, state", [req.body.catTitle, desc, 1],
                function(err, result) {
                    done();
                    if (err) {
                        res.send(err);
                        return console.log(err);
                    }
                    else {
                        res.send(result);
                    }
                })
    });
};

exports.createSubCategory = function(req, res) {
    var desc = "";
    if (req.body.catDesc)
        desc = req.body.subcatDesc.addSlashes();
    pg.connect(conString, function(err, client, done) {
        client.query("INSERT INTO Subcategories (title, description, state, id_Categories) \n\
                    VALUES ($1, $2, $3, $4)", [req.body.subcatTitle, desc, 1, req.body.subcatCategory],
                function(err, result) {
                    done();
                    if (err) {
                        res.send(err);
                        return console.log(err);
                    }
                    else {
                        res.send(result);
                    }
                })
    });
};

exports.getCategories = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT * FROM Categories;",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);

                })
    });
};

exports.getCatDetail = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT * FROM Categories WHERE id = " + req.params.id + ";",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);

                })
    });
};

exports.getSubcat = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("SELECT * FROM Subcategories WHERE id_Categories = " + req.params.id + ";",
                function(err, result) {
                    done();
                    if (err)
                        return console.log(err);
                    res.send(result);

                })
    });
}

exports.activateCat = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("UPDATE Categories SET state = 1 WHERE id = " + req.body.id + ";",
                function(err, result) {
                    done();
                    if (err)
                        console.log(err);
                    res.send(result);
                })
    });
};

exports.deactivateCat = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("UPDATE Categories SET state = 0 WHERE id = " + req.body.id + ";",
                function(err, result) {
                    done();
                    if (err)
                        console.log(err);
                    res.send(result);
                })
    });
};

exports.activateSubCat = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("UPDATE Subcategories SET state = 1 WHERE id = " + req.body.id + ";",
                function(err, result) {
                    done();
                    if (err)
                        console.log(err);
                    res.send(result);
                })
    });
};

exports.deactivateSubCat = function(req, res) {
    pg.connect(conString, function(err, client, done) {
        client.query("UPDATE Subcategories SET state = 0 WHERE id = " + req.body.id + ";",
                function(err, result) {
                    done();
                    if (err)
                        console.log(err);
                    res.send(result);
                })
    });
};


String.prototype.addSlashes = function()
{
    //no need to do (str+'') anymore because 'this' can only be a string
    return this.replace(/'/g, "/'/'")
}

