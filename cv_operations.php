<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if (($method == 'POST' || $method == 'PUT' || $method == 'PATCH') && json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON input. The request may be too large (check post_max_size).']);
    exit;
}

switch ($method) {
    case 'GET':
        handleGet($conn);
        break;
    case 'POST':
        handlePost($conn, $input);
        break;
    case 'PUT':
    case 'PATCH':
        handleUpdate($conn, $input);
        break;
    case 'DELETE':
        handleDelete($conn, $input);
        break;
    default:
        echo json_encode(['error' => 'Invalid Request Method']);
        break;
}

function handleGet($conn)
{
    if (isset($_GET['id'])) {
        $id = $_GET['id'];
        $stmt = $conn->prepare("SELECT * FROM cv_general_info WHERE id = ?");
        $stmt->execute([$id]);
        $cv = $stmt->fetch();

        if ($cv) {
            // Fetch related data
            $cv['education'] = fetchRelated($conn, 'cv_education', $id);
            $cv['experience'] = fetchRelated($conn, 'cv_experience', $id);
            $cv['skills'] = fetchRelated($conn, 'cv_skills', $id);

            // Map keys to camelCase for JS compatibility
            $response = mapKeysToCamelCase($cv);
            echo json_encode($response);
        }
        else {
            echo json_encode(['error' => 'CV not found']);
        }
    }
    else {
        $stmt = $conn->query("SELECT id, full_name, email, color_theme, profile_image FROM cv_general_info ORDER BY created_at DESC");
        $cvs = $stmt->fetchAll();
        $response = array_map('mapKeysToCamelCase', $cvs);
        echo json_encode($response);
    }
}

function fetchRelated($conn, $table, $cvId)
{
    $stmt = $conn->prepare("SELECT * FROM $table WHERE cv_id = ?");
    $stmt->execute([$cvId]);
    $items = $stmt->fetchAll();
    return array_map('mapKeysToCamelCase', $items);
}

function handlePost($conn, $input)
{
    try {
        $conn->beginTransaction();

        $sql = "INSERT INTO cv_general_info (full_name, email, phone, website, address, about_me, profession, color_theme, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $input['fullName'],
            $input['email'],
            $input['phone'] ?? '',
            $input['website'] ?? '',
            $input['address'] ?? '',
            $input['aboutMe'] ?? '',
            $input['profession'] ?? '',
            $input['colorTheme'] ?? '#1a3a52',
            $input['profileImage'] ?? ''
        ]);
        $cvId = $conn->lastInsertId();

        if (!empty($input['education'])) {
            foreach ($input['education'] as $edu) {
                $stmt = $conn->prepare("INSERT INTO cv_education (cv_id, degree, institution, start_year, end_year) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$cvId, $edu['degree'], $edu['institution'], $edu['startYear'], $edu['endYear']]);
            }
        }

        if (!empty($input['experience'])) {
            foreach ($input['experience'] as $exp) {
                $stmt = $conn->prepare("INSERT INTO cv_experience (cv_id, job_title, company, start_year, end_year, description) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$cvId, $exp['jobTitle'], $exp['company'], $exp['startYear'], $exp['endYear'], $exp['description']]);
            }
        }

        if (!empty($input['skills'])) {
            foreach ($input['skills'] as $skill) {
                $stmt = $conn->prepare("INSERT INTO cv_skills (cv_id, skill_name, skill_level) VALUES (?, ?, ?)");
                $stmt->execute([$cvId, $skill['skillName'], $skill['skillLevel']]);
            }
        }

        $conn->commit();
        echo json_encode(['success' => true, 'id' => $cvId]);

    }
    catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function handleUpdate($conn, $input)
{
    if (!isset($input['id'])) {
        echo json_encode(['error' => 'ID is required to update']);
        return;
    }

    $cvId = $input['id'];

    try {
        $conn->beginTransaction();

        $sql = "UPDATE cv_general_info SET full_name=?, email=?, phone=?, website=?, address=?, about_me=?, profession=?, color_theme=?, profile_image=? WHERE id=?";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            $input['fullName'],
            $input['email'],
            $input['phone'] ?? '',
            $input['website'] ?? '',
            $input['address'] ?? '',
            $input['aboutMe'] ?? '',
            $input['profession'] ?? '',
            $input['colorTheme'] ?? '#1a3a52',
            $input['profileImage'] ?? '',
            $cvId
        ]);

        // Delete existing related data and re-insert (simplest way to handle updates)
        $conn->prepare("DELETE FROM cv_education WHERE cv_id = ?")->execute([$cvId]);
        $conn->prepare("DELETE FROM cv_experience WHERE cv_id = ?")->execute([$cvId]);
        $conn->prepare("DELETE FROM cv_skills WHERE cv_id = ?")->execute([$cvId]);

        if (!empty($input['education'])) {
            foreach ($input['education'] as $edu) {
                $stmt = $conn->prepare("INSERT INTO cv_education (cv_id, degree, institution, start_year, end_year) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$cvId, $edu['degree'], $edu['institution'], $edu['startYear'], $edu['endYear']]);
            }
        }

        if (!empty($input['experience'])) {
            foreach ($input['experience'] as $exp) {
                $stmt = $conn->prepare("INSERT INTO cv_experience (cv_id, job_title, company, start_year, end_year, description) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt->execute([$cvId, $exp['jobTitle'], $exp['company'], $exp['startYear'], $exp['endYear'], $exp['description']]);
            }
        }

        if (!empty($input['skills'])) {
            foreach ($input['skills'] as $skill) {
                $stmt = $conn->prepare("INSERT INTO cv_skills (cv_id, skill_name, skill_level) VALUES (?, ?, ?)");
                $stmt->execute([$cvId, $skill['skillName'], $skill['skillLevel']]);
            }
        }

        $conn->commit();
        echo json_encode(['success' => true]);

    }
    catch (Exception $e) {
        $conn->rollBack();
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function handleDelete($conn, $input)
{
    // Check for ID in query parameter first, then body
    $id = $_GET['id'] ?? $input['id'] ?? null;

    if (!$id) {
        echo json_encode(['error' => 'ID is required to delete']);
        return;
    }

    try {
        $stmt = $conn->prepare("DELETE FROM cv_general_info WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
    catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

function mapKeysToCamelCase($data)
{
    $mapped = [];
    foreach ($data as $key => $value) {
        $newKey = lcfirst(str_replace('_', '', ucwords($key, '_')));
        // specific overrides if automatic mapping isn't perfect
        if ($key === 'cv_id')
            $newKey = 'cvId';

        $mapped[$newKey] = $value;
    }
    return $mapped;
}
?>
