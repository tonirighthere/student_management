import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CallApi from '../API/CallApi';
import moment from 'moment';
import './Attendance.css';

function AttendanceStats() {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    lop: localStorage.getItem('lop') || '',
    fromDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
    toDate: moment().format('YYYY-MM-DD')
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!filter.lop) {
      setError('Vui lòng nhập lớp');
      return;
    }
    if (!filter.fromDate || !filter.toDate) {
      setError('Vui lòng chọn khoảng thời gian');
      return;
    }
    
    setError('');
    fetchStats();
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        lop: filter.lop,
        fromDate: filter.fromDate,
        toDate: filter.toDate
      });

      const response = await CallApi(`api/attendance/stats?${queryParams.toString()}`, 'GET');
      if (response && response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Lỗi khi tải thống kê điểm danh:", error);
      setError('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const getAttendanceRate = (present, total) => {
    // Giả sử tổng số ngày điểm danh trong khoảng thời gian là 20 ngày học 
    const workingDays = 20;
    const rate = (present / workingDays) * 100;
    return rate.toFixed(2);
  };

  return (
    <div className="attendance-container">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Thống kê điểm danh</h2>
          <Link to="/home/attendance" className="btn btn-primary">
            <i className="fa fa-arrow-left mr-2"></i> Quay lại
          </Link>
        </div>

        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Lọc thống kê</h5>
          </div>
          <div className="card-body">
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="lop">Lớp</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="lop" 
                      name="lop" 
                      value={filter.lop}
                      onChange={handleFilterChange}
                      placeholder="Nhập lớp"
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="fromDate">Từ ngày</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="fromDate" 
                      name="fromDate"
                      value={filter.fromDate}
                      onChange={handleFilterChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label htmlFor="toDate">Đến ngày</label>
                    <input 
                      type="date" 
                      className="form-control" 
                      id="toDate" 
                      name="toDate"
                      value={filter.toDate}
                      onChange={handleFilterChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span className="sr-only">Đang tải...</span>
                      </span>
                    ) : (
                      <span>Xem thống kê</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Kết quả thống kê điểm danh</h5>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Đang tải...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th>STT</th>
                      <th>Mã SV</th>
                      <th>Họ tên</th>
                      <th>Số buổi tham gia</th>
                      <th>Số buổi đi muộn</th>
                      <th>Tỷ lệ điểm danh</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.length > 0 ? (
                      stats.map((student, index) => {
                        const attendanceRate = getAttendanceRate(student.present_count, 20);
                        return (
                          <tr key={student.msv}>
                            <td>{index + 1}</td>
                            <td>{student.msv}</td>
                            <td>{student.name}</td>
                            <td>{student.present_count}</td>
                            <td>{student.late_count}</td>
                            <td>{attendanceRate}%</td>
                            <td>
                              {attendanceRate >= 80 ? (
                                <span className="badge badge-success">Đạt</span>
                              ) : (
                                <span className="badge badge-danger">Không đạt</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">Không có dữ liệu thống kê</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceStats; 