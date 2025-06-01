import React, { Component } from "react";
import { Link } from "react-router-dom";
import CallApi from "../../API/CallApi";
import axios from "axios";
class AddForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msv: "",
      name: "",
      birthday: "",
      gender: "",
      phone: "",
      address: "",
      sum_of_credits: 0,
      gpa: 0,
      status: "",
      lop: "",
    };
  }

  onChange = (event) => {
    var target = event.target;
    var name = target.name;
    var value = target.value;
    this.setState({
      [name]: value,
    });
  };

  onSubmit = (event) => {
    event.preventDefault();
    
    // Kiểm tra dữ liệu đầu vào
    const { msv, name, birthday, gender, phone, address, sum_of_credits, gpa, status, lop } = this.state;
    
    if (!msv || !name || !birthday || !gender || !phone || !sum_of_credits || !gpa || !status || !lop) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    // Kiểm tra định dạng số điện thoại
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      alert("Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.");
      return;
    }
    
    // Kiểm tra định dạng GPA
    const gpaValue = parseFloat(gpa);
    if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 4) {
      alert("GPA không hợp lệ! Vui lòng nhập giá trị từ 0 đến 4.");
      return;
    }
    
    // Kiểm tra định dạng số tín chỉ
    const creditsValue = parseInt(sum_of_credits);
    if (isNaN(creditsValue) || creditsValue < 0) {
      alert("Số tín chỉ không hợp lệ! Vui lòng nhập số nguyên dương.");
      return;
    }
    
    console.log("Đang thêm sinh viên:", this.state);
    
    // Tạo sinh viên
    CallApi("student/create", "POST", {
      msv: msv,
      name: name,
      birthday: birthday,
      gender: gender,
      phone: phone,
      address: address,
      sum_of_credits: creditsValue,
      gpa: gpaValue,
      status: status,
      lop: lop,
    })
    .then(res => {
      console.log("Kết quả thêm sinh viên:", res.data);
      
      if (res.data.success) {
        // Nếu thêm sinh viên thành công, tạo tài khoản
        this.createStudentAccount(msv, lop);
      } else {
        alert(res.data.message || "Thêm sinh viên thất bại!");
      }
    })
    .catch(error => {
      console.error("Lỗi khi thêm sinh viên:", error);
      
      if (error.response && error.response.data) {
        alert(error.response.data.message || "Thêm sinh viên thất bại!");
      } else {
        alert("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau!");
      }
    });
  };
  
  createStudentAccount = (msv, lop) => {
    CallApi("create-student-account", "POST", {
      username: msv,
      password: msv,
      lop: lop,
    })
    .then(res => {
      console.log("Kết quả tạo tài khoản:", res.data);
      
      if (res.data.success) {
        // Reset form sau khi thêm thành công
        this.setState({
          msv: "",
          name: "",
          birthday: "",
          gender: "",
          phone: "",
          address: "",
          sum_of_credits: 0,
          gpa: 0,
          status: "",
          lop: "",
        });
        
        alert("Đã thêm sinh viên và tạo tài khoản thành công!");
      } else {
        alert(res.data.message || "Tạo tài khoản thất bại!");
      }
    })
    .catch(error => {
      console.error("Lỗi khi tạo tài khoản:", error);
      alert("Đã thêm sinh viên nhưng tạo tài khoản thất bại!");
    });
  };

  render() {
    return (
      <div className="addForm">
        <div className="back">
          <Link to="/home/list-students" className="btn btn-danger">
            <span className="fa fa-arrow-left"></span> &nbsp; Quay lại
          </Link>
        </div>
        <div className="col-xs-5 col-sm-5 col-md-5 col-lg-5 center">
          <div className="panel panel-warning">
            <div className="panel-heading">
              <h3 className="panel-title">Thêm sinh viên</h3>
            </div>
            <div className="panel-body">
              <form onSubmit={this.onSubmit}>
                <div className="form-group">
                  <label>MSV: </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    name="msv"
                    value={this.state.msv}
                    onChange={this.onChange}
                  />
                  <label>Họ và tên: </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    name="name"
                    value={this.state.name}
                    onChange={this.onChange}
                  />
                  <label>Ngày sinh: </label>
                  <input
                    type="date"
                    className="form-control"
                    required
                    name="birthday"
                    value={this.state.birthday}
                    onChange={this.onChange}
                  />
                  <label>Giới tính:</label>
                  <select
                    className="form-control"
                    name="gender"
                    required
                    value={this.state.gender}
                    onChange={this.onChange}
                  >
                    <option>--Select--</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                  <label>Số điện thoại:</label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    name="phone"
                    value={this.state.phone}
                    onChange={this.onChange}
                  />
                  <label>Địa chỉ: </label>
                  <input
                    type="text"
                    className="form-control"
                    name="address"
                    value={this.state.address}
                    onChange={this.onChange}
                  />
                  <label>Tổng số tín chỉ: </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    name="sum_of_credits"
                    value={this.state.sum_of_credits}
                    onChange={this.onChange}
                  />
                  <label>GPA: </label>
                  <input
                    type="text"
                    className="form-control"
                    required
                    name="gpa"
                    value={this.state.gpa}
                    onChange={this.onChange}
                  />
                  <label>Trạng thái: </label>
                  <select
                    className="form-control"
                    required
                    name="status"
                    value={this.state.status}
                    onChange={this.onChange}
                  >
                    <option>--Select--</option>
                    <option value="Không">Không </option>
                    <option value="Nguy cơ nghỉ học">Nguy cơ nghỉ học</option>
                    <option value="Cảnh báo học vụ">Cảnh báo học vụ</option>
                    <option value="Thiếu tín chỉ">Thiếu tín chỉ</option>
                    <option value="Thiếu học phí">Thiếu học phí</option>
                    <option value="Khen thưởng">Khen thưởng</option>
                  </select>{" "}
                  <label>Lớp:</label>
                  <input
                    placeholder="vd: K64-CA-CLC-4"
                    type="text"
                    className="form-control"
                    required
                    name="lop"
                    value={this.state.lop}
                    onChange={this.onChange}
                  />
                  <br />
                  <div className="text_center">
                    <button
                      type="submit"
                      className="button submit btn btn-primary"
                      onClick={this.onSubmit}
                    >
                      <span className="fa fa-plus"></span> &nbsp;Lưu lại
                    </button>{" "}
                    &nbsp;
                    <Link
                      to="/home/list-students"
                      className="button cancle btn btn-primary"
                    >
                      <span className="fa fa-close"></span> &nbsp;Hủy bỏ
                    </Link>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AddForm;
