<?php
// filepath: /c:/xampp/htdocs/startbootstrap-freelancer-gh-pages/api/chat.php
// Set proper headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Groq API configuration
define('GROQ_API_KEY', 'ADD YOUR GROQ API KEY HERE');  // Replace with your actual Groq API key
define('GROQ_API_URL', 'https://api.groq.com/openai/v1/chat/completions');
define('GROQ_MODEL', 'qwen-2.5-32b');  // Can also use 'llama2-70b-4096' or other available models

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$message = $data['message'] ?? '';
$action = $data['action'] ?? '';
$history = $data['history'] ?? [];

// Process based on action
try {
    if ($action === 'summarize') {
        // Handle summarization request
        $response = generateSummary($message, $history);
    } elseif ($action === 'risk_assessment') {
        // Handle risk assessment request
        $response = generateRiskAssessment($message, $history);
    } else {
        // Regular chat response
        $response = generateChatResponse($message, $history);
    }

    // Send success response
    echo json_encode([
        'success' => true,
        'message' => $response
    ]);
} catch (Exception $e) {
    // Handle errors
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred: ' . $e->getMessage()
    ]);
}

/**
 * Generate a summary of the conversation using Groq API
 * 
 * @param string $message The request message
 * @param array $history The conversation history
 * @return string The generated summary
 */
function generateSummary($message, $history) {
    $formattedHistory = formatHistoryForGroq($history);
    
    // Add system prompt for summarization
    $systemPrompt = "You are a helpful medical assistant called MOM (My Own Medic). The user is asking you to summarize your conversation. Provide a concise, well-structured summary of the key points discussed, including:
1. Main topics and health concerns
2. Symptoms mentioned
3. Recommendations provided
4. Any follow-up actions suggested
Format your response with clear headings and bullet points where appropriate.";
    
    // Create the full message array including system prompt, conversation history, and the summary request
    $messages = [
        [
            'role' => 'system',
            'content' => $systemPrompt
        ]
    ];
    
    // Add conversation history
    foreach ($formattedHistory as $msg) {
        $messages[] = $msg;
    }
    
    // Add the summarize request
    $messages[] = [
        'role' => 'user',
        'content' => "Please summarize our conversation so far."
    ];
    
    // Call Groq API
    return callGroqAPI($messages);
}

/**
 * Generate a risk assessment based on the conversation using Groq API
 * 
 * @param string $message The request message
 * @param array $history The conversation history
 * @return string The generated risk assessment
 */
function generateRiskAssessment($message, $history) {
    $formattedHistory = formatHistoryForGroq($history);
    
    // Add system prompt for risk assessment
    $systemPrompt = "You are a helpful medical assistant called MOM (My Own Medic). The user is asking you to provide a future risk assessment based on your conversation. 
    
Analyze the conversation for mentioned health conditions, symptoms, lifestyle factors, and concerns. Then provide a structured risk assessment that includes:

1. Short-term considerations related to current symptoms or concerns
2. Long-term health considerations based on risk factors identified
3. Recommended preventative measures and health monitoring actions

Format your response with clear headings. Be informative but don't diagnose or alarm unnecessarily. Include a disclaimer that this is general guidance, not medical diagnosis.";
    
    // Create the full message array including system prompt, conversation history, and the risk assessment request
    $messages = [
        [
            'role' => 'system',
            'content' => $systemPrompt
        ]
    ];
    
    // Add conversation history
    foreach ($formattedHistory as $msg) {
        $messages[] = $msg;
    }
    
    // Add the risk assessment request
    $messages[] = [
        'role' => 'user',
        'content' => "Based on our conversation, please provide a future risk assessment of potential health concerns I should be aware of."
    ];
    
    // Call Groq API
    return callGroqAPI($messages);
}

/**
 * Generate a regular chat response using Groq API
 * 
 * @param string $message The user's message
 * @param array $history The conversation history
 * @return string The generated response
 */
function generateChatResponse($message, $history = []) {
    $formattedHistory = formatHistoryForGroq($history);
    
    // Add system prompt for general chat
    $systemPrompt = "You are a helpful medical assistant called MOM (My Own Medic). You provide informative, evidence-based health information and guidance while being friendly and supportive. 

Important guidelines:
1. Do not diagnose - always suggest consulting a healthcare professional
2. Be empathetic and reassuring while providing accurate information
3. When discussing treatments, mention both conventional and lifestyle approaches when appropriate
4. Include appropriate disclaimers when addressing serious medical concerns
5. If you don't know something, be honest and suggest seeking professional advice
6. Use clear language and avoid medical jargon when possible, or explain terms when used
7. Format your responses in a readable way using markdown when helpful

Remember that you are providing general health information and guidance, not medical diagnosis or treatment.";
    
    // Create the full message array including system prompt, conversation history, and the new message
    $messages = [
        [
            'role' => 'system',
            'content' => $systemPrompt
        ]
    ];
    
    // Add conversation history
    foreach ($formattedHistory as $msg) {
        $messages[] = $msg;
    }
    
    // Add the user's new message
    $messages[] = [
        'role' => 'user',
        'content' => $message
    ];
    
    // Call Groq API
    return callGroqAPI($messages);
}

/**
 * Format chat history for Groq API
 * 
 * @param array $history The conversation history
 * @return array Formatted history for Groq API
 */
function formatHistoryForGroq($history) {
    $formattedHistory = [];
    
    // Skip the first message if it's the initial greeting
    $startIndex = 0;
    if (count($history) > 0 && 
        $history[0]['role'] === 'assistant' && 
        strpos($history[0]['content'], "Hello! I'm MOM") !== false) {
        $startIndex = 1;
    }
    
    // Format the rest of the history
    for ($i = $startIndex; $i < count($history); $i++) {
        $formattedHistory[] = [
            'role' => $history[$i]['role'],
            'content' => $history[$i]['content']
        ];
    }
    
    return $formattedHistory;
}

/**
 * Call Groq API to generate response
 * 
 * @param array $messages The message array for the API
 * @return string The generated response
 */
function callGroqAPI($messages) {
    // Prepare the request data
    $requestData = [
        'model' => GROQ_MODEL,
        'messages' => $messages,
        'temperature' => 0.7,
        'max_tokens' => 4000
    ];
    
    // Initialize cURL session
    $ch = curl_init(GROQ_API_URL);
    
    // Set cURL options
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . GROQ_API_KEY
    ]);
    
    // Execute cURL request and get response
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    // Check for errors
    if (curl_errno($ch)) {
        throw new Exception('cURL error: ' . curl_error($ch));
    }
    
    // Close cURL session
    curl_close($ch);
    
    // Handle HTTP errors
    if ($httpCode !== 200) {
        $errorData = json_decode($response, true);
        $errorMessage = isset($errorData['error']['message']) ? $errorData['error']['message'] : 'Unknown API error';
        throw new Exception('Groq API error: ' . $errorMessage);
    }
    
    // Parse the response
    $responseData = json_decode($response, true);
    
    // Check if the response contains the expected data
    if (!isset($responseData['choices'][0]['message']['content'])) {
        throw new Exception('Unexpected API response format');
    }
    
    // Return the generated content
    return $responseData['choices'][0]['message']['content'];
}

/**
 * Log errors to file for debugging
 * 
 * @param mixed $data Data to log
 * @param string $prefix Optional prefix for the log entry
 */
function logError($data, $prefix = '') {
    $logFile = __DIR__ . '/error_log.txt';
    $logEntry = date('Y-m-d H:i:s') . ' ' . $prefix . ': ' . print_r($data, true) . "\n\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}
?>