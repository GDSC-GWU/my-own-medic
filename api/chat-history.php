<?php
// filepath: /c:/xampp/htdocs/startbootstrap-freelancer-gh-pages/api/chat-history.php
// Set proper headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// File to store chat history
$history_file = __DIR__ . '/chat_history.json';

// Create history file if it doesn't exist
if (!file_exists($history_file)) {
    // Make sure the directory exists
    $dir = dirname($history_file);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    
    file_put_contents($history_file, json_encode([
        'chats' => []
    ]));
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Get the chat history
function getChatHistory() {
    global $history_file;
    $data = json_decode(file_get_contents($history_file), true);
    if (!isset($data['chats'])) {
        $data['chats'] = [];
    }
    return $data['chats'];
}

// Save a new chat to history
function saveChatToHistory($title, $messages) {
    global $history_file;
    $data = json_decode(file_get_contents($history_file), true);
    
    if (!isset($data['chats'])) {
        $data['chats'] = [];
    }
    
    $chatId = time(); // Use timestamp as ID
    
    // Create a preview from the first user message
    $preview = "";
    foreach ($messages as $message) {
        if ($message['role'] === 'user') {
            $preview = $message['content'];
            break;
        }
    }
    
    // Truncate preview if too long
    if (strlen($preview) > 30) {
        $preview = substr($preview, 0, 30) . "...";
    }
    
    // Add new chat to history
    $data['chats'][$chatId] = [
        'id' => $chatId,
        'title' => $title ?: $preview,
        'preview' => $preview,
        'date' => time(),
        'updated_at' => time(),
        'messages' => $messages
    ];
    
    // Re-sort chats (to bring recently updated to top)
    uasort($data['chats'], function($a, $b) {
        return ($b['updated_at'] ?? 0) - ($a['updated_at'] ?? 0);
    });
    
    // Save to file
    file_put_contents($history_file, json_encode($data));
    
    return $chatId;
}

// Update an existing chat in history
function updateChatHistory($chatId, $title, $messages) {
    global $history_file;
    $data = json_decode(file_get_contents($history_file), true);
    
    if (!isset($data['chats'])) {
        $data['chats'] = [];
    }
    
    // If chat doesn't exist, create a new one
    if (!isset($data['chats'][$chatId])) {
        return saveChatToHistory($title, $messages);
    }
    
    // Create a preview from the first user message
    $preview = "";
    foreach ($messages as $message) {
        if ($message['role'] === 'user') {
            $preview = $message['content'];
            break;
        }
    }
    
    // Truncate preview if too long
    if (strlen($preview) > 30) {
        $preview = substr($preview, 0, 30) . "...";
    }
    
    // Update existing chat
    $data['chats'][$chatId]['title'] = $title ?: $data['chats'][$chatId]['title'];
    $data['chats'][$chatId]['preview'] = $preview;
    $data['chats'][$chatId]['updated_at'] = time();
    $data['chats'][$chatId]['messages'] = $messages;
    
    // Re-sort chats (to bring recently updated to top)
    uasort($data['chats'], function($a, $b) {
        return ($b['updated_at'] ?? 0) - ($a['updated_at'] ?? 0);
    });
    
    // Save to file
    file_put_contents($history_file, json_encode($data));
    
    return $chatId;
}

// Delete a chat from history
function deleteChatFromHistory($chatId) {
    global $history_file;
    $data = json_decode(file_get_contents($history_file), true);
    
    if (isset($data['chats'][$chatId])) {
        unset($data['chats'][$chatId]);
        file_put_contents($history_file, json_encode($data));
        return true;
    }
    return false;
}

// Handle GET request to retrieve chat history
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['id'])) {
        // Get specific chat
        $chatId = $_GET['id'];
        $history = getChatHistory();
        
        if (isset($history[$chatId])) {
            echo json_encode([
                'success' => true,
                'chat' => $history[$chatId]
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Chat not found'
            ]);
        }
    } else {
        // Get all chats (for sidebar)
        $chats = getChatHistory();
        $chatList = [];
        
        foreach ($chats as $id => $chat) {
            $chatList[] = [
                'id' => $id,
                'title' => $chat['title'],
                'preview' => $chat['preview'],
                'date' => $chat['date']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'chats' => $chatList
        ]);
    }
}

// Handle POST request to save new chat
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['messages']) || !is_array($data['messages'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Messages array is required'
        ]);
        exit;
    }
    
    $title = $data['title'] ?? '';
    $chatId = saveChatToHistory($title, $data['messages']);
    
    echo json_encode([
        'success' => true,
        'chatId' => $chatId
    ]);
}

// Handle PUT request to update existing chat
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Get chat ID from URL parameter
    $requestUri = $_SERVER['REQUEST_URI'];
    $parts = explode('?', $requestUri);
    
    if (isset($parts[1])) {
        parse_str($parts[1], $params);
        if (isset($params['id'])) {
            $chatId = $params['id'];
            $data = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($data['messages']) || !is_array($data['messages'])) {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Messages array is required'
                ]);
                exit;
            }
            
            $title = $data['title'] ?? '';
            $chatId = updateChatHistory($chatId, $title, $data['messages']);
            
            echo json_encode([
                'success' => true,
                'chatId' => $chatId
            ]);
        }
    }
}

// Handle DELETE request to remove chat history
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Get chat ID from URL parameter
    $requestUri = $_SERVER['REQUEST_URI'];
    $parts = explode('?', $requestUri);
    
    if (isset($parts[1])) {
        parse_str($parts[1], $params);
        if (isset($params['id'])) {
            $chatId = $params['id'];
            $success = deleteChatFromHistory($chatId);
            
            if ($success) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Chat deleted successfully'
                ]);
            } else {
                http_response_code(404);
                echo json_encode([
                    'success' => false,
                    'error' => 'Chat not found'
                ]);
            }
            exit;
        }
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Chat ID is required'
    ]);
}
?>