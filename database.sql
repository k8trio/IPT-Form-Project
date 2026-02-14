--use 3307 port in XAMPP and mysql connection(mysql workbench)

CREATE DATABASE IF NOT EXISTS cv_db;
USE cv_db;

CREATE TABLE IF NOT EXISTS cv_general_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website VARCHAR(255),
    address TEXT,
    about_me TEXT,
    profession VARCHAR(255),
    color_theme VARCHAR(20) DEFAULT '#1a3a52',
    profile_image LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cv_education (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    degree VARCHAR(255),
    institution VARCHAR(255),
    start_year VARCHAR(20),
    end_year VARCHAR(20),
    FOREIGN KEY (cv_id) REFERENCES cv_general_info(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cv_experience (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    job_title VARCHAR(255),
    company VARCHAR(255),
    start_year VARCHAR(20),
    end_year VARCHAR(20),
    description TEXT,
    FOREIGN KEY (cv_id) REFERENCES cv_general_info(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cv_skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cv_id INT NOT NULL,
    skill_name VARCHAR(255),
    skill_level INT,
    FOREIGN KEY (cv_id) REFERENCES cv_general_info(id) ON DELETE CASCADE
);
