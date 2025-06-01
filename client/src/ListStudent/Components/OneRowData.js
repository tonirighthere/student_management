/* eslint-disable no-restricted-globals */
/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { Link } from "react-router-dom";
import moment from "moment";

class OneRowData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDeleting: false
    };
  }

  onDelete = (_id, msv) => {
    // Kiểm tra ID hợp lệ
    if (!_id) {
      alert("Không thể xóa: ID sinh viên không hợp lệ!");
      return;
    }
    
    // Đánh dấu đang xóa để có thể thêm hiệu ứng
    this.setState({ isDeleting: true });
    
    // Gọi hàm xóa từ component cha
    console.log("Xóa sinh viên với ID:", _id, "và MSV:", msv);
    this.props.onDelete(_id, msv);
  };

  render() {
    var { student, index } = this.props;
    const { isDeleting } = this.state;
    const studentId = student._id || student.id;
    
    // Thêm style khi đang xóa
    const rowStyle = {
      height: '30px',
      opacity: isDeleting ? 0.5 : 1,
      transition: 'opacity 0.3s ease',
      backgroundColor: isDeleting ? '#ffcccc' : 'transparent'
    };
    
    return (
      <tr style={rowStyle}>
        <td className='text_center'>{index + 1}</td>
        <td className='text_center'>{student.msv}</td>
        <td>{student.name}</td>
        <td className='text_center'>
          {moment(student.birthday).format("DD/MM/YYYY")}
        </td>
        <td className='text_center'>{student.gender}</td>
        <td className='text_center'>{student.gpa}</td>
        <td className='text_center'>{student.status}</td>
        <td className='text_center'>
          <Link
            to={`/home/list-students/update/${studentId}`}
            className='btn btn-warning'>
            <span className='fa fa-info'></span> &nbsp;Chi tiết
          </Link>{" "}
          &nbsp;
          <button
            className='btn btn-danger'
            type='button'
            disabled={isDeleting}
            onClick={() => this.onDelete(studentId, student.msv)}>
            <span className='fa fa-trash'></span> &nbsp;{isDeleting ? 'Đang xóa...' : 'Xóa'}
          </button>{" "}
          &nbsp;
        </td>
      </tr>
    );
  }
}

export default OneRowData;
