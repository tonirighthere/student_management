/* eslint-disable react/jsx-pascal-case */
import React, { Component } from "react";
import axios from "axios";
import { Redirect } from "react-router-dom";
import styled from "styled-components";
import { FaUser } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import Logo from "./logo2.webp";
import AppLogo from "./applogo_2.png";

const Body = styled.div`
  // background-color: rgb(231, 72, 72);
  position: relative;
  overflow: hidden;
  height: 100vh;
`;
const Container = styled.div`
  width: 100%;
  display: flex;
`;
const _Input = styled.input`
  border: 0;
  border-bottom: 2px solid rgb(218, 72, 72);
  outline: 0;
  background: transparent;
  width: 60%;
`;
const _Button = styled.button`
  width: 260px;
  margin-left: 70px;
  height: 40px;
  background-color:rgb(224, 87, 87);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.8rem;
  transition: all 0.3s ease;
  opacity: 0.9;
  &:hover {
    opacity: 1;
    box-shadow: 0 4px 8px 4px rgba(0, 0, 0, 0.2),
      0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }
`;

const Icon = styled.i`
  padding: 0px 5px 2px 0px;
  border-bottom: 2px solid rgb(240, 80, 85);
  margin-left: 18%;
  // margin-right: 5px;
  color:rgb(228, 73, 76);
`;
const Title = styled.p`
  text-align: center;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  font-weight: 600;
  font-size: 3rem;
  color:rgb(234, 81, 94);
  padding: 20px 0px 20px 0px;
`;
const Title1 = styled.p`
  width: 150px;
  margin: auto;
  text-align: center;
  font-family: "Poppins", sans-serif;
  font-weight: bold;
  font-size: 1.5rem;
  padding-top: 15px;
  padding-bottom: 15px;
  opacity: 0.8;
  transition: all 0.3s ease;
  &:hover {
    cursor: pointer;
    opacity: 1;
  }
`;
const Form = styled.form`
  width: 400px;
  height: 500px;
  margin-top: 100px;
  background-color: white;
  margin-left: 30%;
  border-radius: 60px;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
`;
const Input_container = styled.div`
  padding: 0 0 10px 0;
`;
const Uet_logo = styled.img`
  width: 100px;
  height: 100px;
  margin-left: 150px;
  margin-top: 20px;
`;
const App_logo = styled.img`
  width: 600px;
  height: 250px;
`;
const App_logo_container = styled.div`
  margin-top: 200px;
  margin-left: 150px;
`;
const Form_container = styled.div``;
const Line1 = styled.div`
  top: -11rem;
  left: -6rem;
  position: absolute;
  width: 500px;
  height: 350px;
  border: 4px solid rgb(221, 70, 77);
  border-radius: 50%;
`;
const Line2 = styled.div`
  position: absolute;
  overflow: hidden;
  width: 450px;
  height: 350px;
  border: 4px solid rgb(221, 70, 77);
  border-radius: 50%;
  right: -6.5rem;
  bottom: -6rem;
  opacity: 0.8;
`;
const Comment = styled.p`
  margin: auto;
  max-width: 380px;
  text-align: center;
  font-size: 1.4rem;
  color: rgb(221, 70, 77);
  transition: all 0.3s ease;
  font-weight: bold;
  opacity: 0.6;
  line-height: 3rem;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  &:hover {
    opacity: 1;
  }
`;
const Comment1 = styled.p`
  margin: auto;
  max-width: 380px;
  text-align: center;
  font-size: 1.4rem;
  color: rgb(221, 70, 77);
  transition: all 0.3s ease;
  font-weight: bold;
  opacity: 0.6;
  line-height: 3rem;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  &:hover {
    opacity: 1;
  }
`;
const Comment2 = styled.p`
  margin: auto;
  max-width: 380px;
  text-align: center;
  font-size: 1.4rem;
  color: rgb(221, 70, 77);
  transition: all 0.3s ease;
  font-weight: bold;
  opacity: 0.6;
  line-height: 3rem;
  font-family: Verdana, Geneva, Tahoma, sans-serif;
  &:hover {
    opacity: 1;
  }
`;
class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: "",
      isLogin: false,
    };
    this.handle = this.handle.bind(this);
    this.submit = this.submit.bind(this);
  }

  handle = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value,
    });
  };

  submit = async (event) => {
    event.preventDefault();

    await axios
      .post("http://localhost:5000/login", {
        username: this.state.username,
        password: this.state.password,
      })
      .then((res) => {
        localStorage.setItem("accessToken", res.data.accessToken);
        sessionStorage.setItem("role", res.data.role);
        sessionStorage.setItem("userId", res.data.userId);
        sessionStorage.setItem("msv", res.data.username);
        sessionStorage.setItem("lop", res.data.lop);
        console.log(res);
      })
      .catch(function (error) {
        console.log(error);
      });

    this.setState({
      isLogin: localStorage.getItem("accessToken") != null,
    });
  };

  render() {
    if (this.state.isLogin === true) {
      return <Redirect to='/home' />;
    } else {
      return (
        <Body>
          <Line1></Line1>
          <Line2></Line2>
          <Container>
            <App_logo_container>
              <App_logo src={AppLogo} />
              <Comment>Hệ thống hỗ trợ quản lý sinh viên Ptit369</Comment>
              <Comment1>Xây dựng và phát triển bởi N4 - TTCS N48</Comment1>
              <Comment2>Học viện Công Nghệ Bưu Chính Viễn Thông - PTIT</Comment2>
            </App_logo_container>
            <Form_container>
              <Form action='' method='post' onSubmit={this.submit}>
                <Uet_logo src={Logo} />
                <Title>ĐĂNG NHẬP</Title>
                <Input_container>
                  <Icon>
                    <FaUser />
                  </Icon>
                  <_Input
                    type='text'
                    required
                    name='username'
                    placeholder='Email đăng nhập'
                    value={this.state.username}
                    onChange={this.handle}
                    autoFocus
                  />
                </Input_container>
                <br />
                <Input_container>
                  <Icon>
                    <RiLockPasswordFill />
                  </Icon>
                  <_Input
                    type='password'
                    name='password'
                    placeholder='Mật khẩu'
                    // value={this.state.password}

                    onChange={this.handle}></_Input>
                </Input_container>
                <br />
                {/* <Title1>Quên mật khẩu?</Title1> */}
                <_Button onClick={this.submit}>Đăng nhập</_Button>
                <br />
              </Form>
            </Form_container>
          </Container>
        </Body>
      );
    }
  }
}

export default Login;
