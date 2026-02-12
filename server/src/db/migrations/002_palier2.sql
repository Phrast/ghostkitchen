USE ghostkitchen;

ALTER TABLE restaurants ADD COLUMN satisfaction INT DEFAULT 20;

CREATE TABLE orders (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    restaurant_id INT NOT NULL,
    recipe_id     INT NOT NULL,
    status        VARCHAR(20) DEFAULT 'pending',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at   TIMESTAMP NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id)
);
