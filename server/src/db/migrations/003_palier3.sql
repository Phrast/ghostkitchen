USE ghostkitchen;

ALTER TABLE restaurants ADD COLUMN treasury INT DEFAULT 500;
ALTER TABLE ingredients ADD COLUMN buy_price INT DEFAULT 10;

CREATE TABLE stock (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity      INT DEFAULT 0,
    UNIQUE(restaurant_id, ingredient_id),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE transactions (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    type          VARCHAR(20) NOT NULL,
    amount        INT NOT NULL,
    description   TEXT,
    recipe_id     INT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);

-- Set buy prices for ingredients
UPDATE ingredients SET buy_price = 3 WHERE name = 'Tomato';
UPDATE ingredients SET buy_price = 5 WHERE name = 'Cheese';
UPDATE ingredients SET buy_price = 4 WHERE name = 'Dough';
UPDATE ingredients SET buy_price = 2 WHERE name = 'Lettuce';
UPDATE ingredients SET buy_price = 6 WHERE name = 'Chicken';
UPDATE ingredients SET buy_price = 4 WHERE name = 'Rice';
UPDATE ingredients SET buy_price = 7 WHERE name = 'Fish';
UPDATE ingredients SET buy_price = 2 WHERE name = 'Egg';
UPDATE ingredients SET buy_price = 3 WHERE name = 'Flour';
UPDATE ingredients SET buy_price = 3 WHERE name = 'Butter';
UPDATE ingredients SET buy_price = 2 WHERE name = 'Sugar';
UPDATE ingredients SET buy_price = 5 WHERE name = 'Chocolate';
