import axios from "axios";

// Tạo một axios instance với baseURL
const apiClient = axios.create({
  baseURL: "http://localhost:5000", // Địa chỉ backend server của bạn
});

// Thêm interceptor để log request và response
apiClient.interceptors.request.use(
  config => {
    console.log('API Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  error => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    console.log('API Response Status:', response.status);
    return response;
  },
  error => {
    console.error('Response Error:', error.message);
    if (error.response) {
      console.error('Error Status:', error.response.status);
      console.error('Error Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);

export default function CallApi(endpoint, method = "GET", body) {
  const headers = body instanceof FormData
    ? {} // Để axios tự đặt Content-Type cho FormData
    : { 'Content-Type': 'application/json' };

  // Bỏ dấu gạch chéo ở đầu nếu có, để đảm bảo đường dẫn được nối đúng cách
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // Đường dẫn cuối cùng sẽ được nối với baseURL
  // Ví dụ: nếu endpoint là "student/create", url sẽ là "http://localhost:5000/student/create"
  const finalUrlPath = cleanEndpoint;

  // Xử lý đặc biệt cho phương thức DELETE
  if (method.toUpperCase() === 'DELETE') {
    console.log('Sending DELETE request to:', finalUrlPath);
    
    // Đối với DELETE, không cần gửi body
    return apiClient({
      method: method,
      url: finalUrlPath,
      headers: headers,
      timeout: 15000,
    }).catch((err) => {
      handleApiError(err, finalUrlPath);
      throw err;
    });
  }

  // Xử lý các phương thức khác
  return apiClient({
    method: method,
    url: finalUrlPath, 
    data: body,
    headers: headers,
    timeout: 15000, // Tăng thời gian chờ lên 15 giây
  }).catch((err) => {
    handleApiError(err, finalUrlPath);
    throw err;
  });
}

// Hàm xử lý lỗi API riêng biệt
function handleApiError(err, endpoint) {
  if (err.response) {
    // Máy chủ trả về lỗi với status code
    console.error(`API Error ${err.response.status} for ${endpoint}:`, err.response.data);
    
    // Xử lý các mã lỗi cụ thể
    switch (err.response.status) {
      case 400:
        console.error('Lỗi Bad Request: Dữ liệu gửi đi không hợp lệ');
        break;
      case 401:
        console.error('Lỗi Unauthorized: Bạn cần đăng nhập');
        break;
      case 403:
        console.error('Lỗi Forbidden: Bạn không có quyền truy cập');
        break;
      case 404:
        console.error('Lỗi Not Found: Không tìm thấy tài nguyên');
        break;
      case 500:
        console.error('Lỗi Server: Máy chủ gặp sự cố');
        break;
      default:
        console.error('Lỗi không xác định');
    }
  } else if (err.request) {
    // Request đã được gửi nhưng không nhận được response
    console.error('Không nhận được phản hồi từ máy chủ:', err.request);
  } else {
    // Lỗi khi thiết lập request
    console.error('Lỗi khi gọi API:', err.message);
  }
}
