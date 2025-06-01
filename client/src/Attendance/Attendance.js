import React, { useState, useEffect, useCallback } from 'react';
import { Link, useHistory } from 'react-router-dom';
import CallApi from '../API/CallApi';
import moment from 'moment';
import './Attendance.css';

function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    date: moment().format('YYYY-MM-DD')
  });

  useEffect(() => {
    fetchAttendance();
  }, [filter]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter.date) queryParams.append('date', filter.date);
      if (filter.lop) queryParams.append('lop', filter.lop);
      if (filter.msv) queryParams.append('msv', filter.msv);

      const response = await CallApi(`api/attendance?${queryParams.toString()}`, 'GET');
      if (response && response.data.success) {
        setRecords(response.data.records);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu điểm danh:", error);
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

  return (
    <div className="attendance-container">
      <div className="container mt-4">
        <h2 className="mb-4">Quản lý điểm danh</h2>
        
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Tùy chọn điểm danh</h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <Link to="/home/attendance/recognition" className="btn btn-success w-100">
                  <i className="fa fa-camera mr-2"></i> Điểm danh bằng nhận diện khuôn mặt
                </Link>
              </div>
              <div className="col-md-4">
                <Link to="/home/attendance/stats" className="btn btn-info w-100">
                  <i className="fa fa-chart-bar mr-2"></i> Thống kê điểm danh
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Danh sách điểm danh</h5>
          </div>
          <div className="card-body">
            <div className="row mb-3">
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="date">Ngày</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    id="date" 
                    name="date"
                    value={filter.date}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="lop">Lớp</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="lop" 
                    name="lop" 
                    placeholder="Nhập lớp"
                    value={filter.lop || ''}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <div className="form-group">
                  <label htmlFor="msv">Mã sinh viên</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    id="msv" 
                    name="msv" 
                    placeholder="Nhập mã SV"
                    value={filter.msv || ''}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>

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
                      <th>Lớp</th>
                      <th>Thời gian điểm danh</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.length > 0 ? (
                      records.map((record, index) => (
                        <tr key={record.id}>
                          <td>{index + 1}</td>
                          <td>{record.msv}</td>
                          <td>{record.name}</td>
                          <td>{record.lop}</td>
                          <td>{moment(record.time).format('DD/MM/YYYY HH:mm:ss')}</td>
                          <td>
                            <span className={`badge badge-${record.status === 'present' ? 'success' : 'warning'}`}>
                              {record.status === 'present' ? 'Có mặt' : 'Muộn'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">Không có dữ liệu điểm danh</td>
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

export default Attendance; 