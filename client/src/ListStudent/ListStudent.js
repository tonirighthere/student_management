/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import "./ListStudent.css";
import ListSV from "./Components/ListSV";
import { Link } from "react-router-dom";
import CallApi from "../API/CallApi";
import ExportToExcel from "./Components/ExportData";

class ListStudent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      students: [],
      lop: [],
      item: sessionStorage.getItem("item"),
    };
  }

  componentDidMount() {
    const lopValue = sessionStorage.getItem("lop");
    if (lopValue) {
      this.setState({
        lop: lopValue.split(", "),
      });
    }

    var item = sessionStorage.getItem("item");
    CallApi(`student/all/${item}`, "GET", null).then((res) => {
      if (res.data.ListStudents != null) {
        this.setState({
          students: res.data.ListStudents,
        });
      } else {
        this.setState({
          students: [],
        });
      }
      console.log(this.state.students);
    });
  }
  

  ChooseClass = (item) => {
    sessionStorage.setItem("item", item);
    CallApi(`student/all/${item}`, "GET", null).then((res) => {
      if (res.data.ListStudents != null) {
        this.setState({
          students: res.data.ListStudents,
        });
      } else {
        this.setState({
          students: [],
        });
      }
    });
  };

  findIndex = (_id) => {
    var { students } = this.state;
    var result = -1;
    students.forEach((student, index) => {
      if (student._id === _id) result = index;
    });
    return result;
  };

  onDelete = (_id, msv) => {
    if (!_id) {
      console.error("Không thể xóa: ID sinh viên không hợp lệ");
      alert("Không thể xóa sinh viên. ID không hợp lệ!");
      return;
    }
    
    console.log("Đang xóa sinh viên với ID:", _id);
    
    // Xóa sinh viên khỏi state trước khi gọi API
    const { students } = this.state;
    const updatedStudents = students.filter(student => 
      (student._id !== _id && student.id !== _id)
    );
    
    // Cập nhật state ngay lập tức
    this.setState({
      students: updatedStudents
    }, () => {
      console.log("State đã được cập nhật, số lượng sinh viên còn lại:", this.state.students.length);
      
      // Force component re-render
      this.forceUpdate();
    });
    
    // Gọi API để xóa sinh viên từ server
    CallApi(`student/delete/${_id}`, "DELETE", null)
      .then((res) => {
        console.log("Kết quả xóa sinh viên:", res.data);
        
        // Sau khi xóa sinh viên thành công, xóa tài khoản
        if (res.status === 200 && msv) {
          this.deleteStudentAccount(msv);
        }
      })
      .catch((error) => {
        console.error("Lỗi khi xóa sinh viên:", error);
        
        // Nếu xóa thất bại, khôi phục lại danh sách sinh viên
        this.setState({
          students: students
        }, () => {
          // Force component re-render
          this.forceUpdate();
        });
        
        alert("Xóa sinh viên thất bại. Vui lòng thử lại sau!");
      });
  };
  
  deleteStudentAccount = (msv) => {
    if (!msv) {
      console.error("Không thể xóa tài khoản: MSV không hợp lệ");
      return;
    }
    
    console.log("Đang xóa tài khoản sinh viên với MSV:", msv);
    
    CallApi(`delete-student-account/${msv}`, "DELETE", null)
      .then((res) => {
        console.log("Kết quả xóa tài khoản:", res.data);
      })
      .catch((error) => {
        console.error("Lỗi khi xóa tài khoản sinh viên:", error);
        // Không hiển thị alert vì đã xóa sinh viên thành công
      });
  };

  render() {
    const { lop, students } = this.state;
    console.log("Rendering ListStudent with students:", students);
    
    return (
      <div className='Container'>
        <div className='text_center'>
          <h1 id='qlsv'>Quản lý sinh viên</h1>
        </div>
        <div className='col-xs-12 col-sm-12 col-md-12 col-lg-12'>
          &nbsp;
          <div className='dropdown'>
            <button
              type='button'
              className='btn dropdown-toggle'
              id='dropdownMsv'
              data-toggle='dropdown'
              aria-haspopup='true'
              aria-expanded='true'>
              Lớp &nbsp; <span className='fa fa-caret-square-o-down'></span>
            </button>
            <ul className='dropdown-menu' aria-labelledby='dropdownMenu1'>
              {lop.map((item) => (
                <li
                  to='/home/list-students'
                  key={item}
                  onClick={() => this.ChooseClass(item)}>
                  <a role='button'>{item}</a>
                </li>
              ))}
            </ul>
          </div>
          <label
            style={{
              paddingTop: "8px",
              paddingBottom: "2px",
              marginRight: "10px",
            }}>
            {sessionStorage.getItem("item")}
          </label>
          <Link to='/home/list-students/add' className='btn btn-primary'>
            <span className='fa fa-plus'></span> &nbsp; Thêm sinh viên
          </Link>{" "}
          &nbsp;
          <div className='data'>
            <ExportToExcel apiData={students} fileName={this.state.item} />
          </div>
          &nbsp;
          <Link
            to='/home/list-students/import-data'
            className='btn btn-primary data'>
            <span className='fa fa-file-import'></span>&nbsp; Nhập dữ liệu từ
            Excel
          </Link>
          <div className='row'>
            <div className='col-xs-12 col-sm-12 col-md-12 col-lg-12'>
              <ListSV 
                students={students} 
                onDelete={this.onDelete} 
                key={students.length}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ListStudent;
