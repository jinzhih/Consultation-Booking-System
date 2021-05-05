import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import {
    LogInThunkAction,
} from '../redux/actions/loginAction';
import { Form, Input, Button, Checkbox, Spin, Alert, notification   } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { STUDENT_HOME_URL, ADMIN_HOME_URL } from '../routes/URLMap';
import './logIn.scss';
//TODO href update
class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
        };
    }

    handleChange = (event) => {
        const key = event.target.name;
        const value = event.target.value;
        this.setState({ [key]: value });
    };

    loginUser = (event) => {
        event.preventDefault();
        const {handleLogIn} = this.props;
        const {email, password} = this.state;
        handleLogIn(email, password);
    }

    render() {
        const {
            isLoading,
            isAuthenticated,
            error,
            userType,
        } = this.props;

        const openNotification = () => {
            notification.open({
                message: 'Demo Account',
                description:
                    'Student1 Account: test1@test.com  Password: test999 Student2 Account: test2@test.com  Password: test999 Admin Account: admin@test.com  Password: test999',
            });
        };

        let authRedirect = null;
        if (isAuthenticated && userType === 'student') {
            authRedirect = <Redirect to={STUDENT_HOME_URL} />;
        }
        if (isAuthenticated && userType === 'admin') {
            authRedirect = <Redirect to={ADMIN_HOME_URL} />;
        }

        let errorMessage = null;
        if (error) {
            errorMessage = (
                <Form.Item>
                    <Alert message='Invalid Email or Password' type='error' />
                </Form.Item>
            );
        }

        return (
            <div className='l-login'>
                {isLoading ? (
                    <Spin size='large' tip='Loading...' />
                ) : (
                    <Fragment>
                        {authRedirect}
                        <h1 className='l-login__title'>AIBT Booking System</h1>
                        <div className='b-form-container'>
                            <Form
                                name='normal_login'
                                className='login-form'
                                initialValues={{
                                    remember: true,
                                }}
                            >
                                {errorMessage}
                                <Form.Item
                                    name='email'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please input your Email!',
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={
                                            <UserOutlined className='site-form-item-icon' />
                                        }
                                        placeholder='Email'
                                        onChange={this.handleChange}
                                        value={this.state.email}
                                        name='email'
                                    />
                                </Form.Item>
                                <Form.Item
                                    name='password'
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                'Please input your Password!',
                                        },
                                    ]}
                                >
                                    <Input
                                        prefix={
                                            <LockOutlined className='site-form-item-icon' />
                                        }
                                        type='password'
                                        placeholder='Password'
                                        onChange={this.handleChange}
                                        value={this.state.password}
                                        name='password'
                                    />
                                </Form.Item>
                                <Form.Item>
                                    <Form.Item
                                        name='remember'
                                        valuePropName='checked'
                                        noStyle
                                    >
                                        <Checkbox>Remember me</Checkbox>
                                    </Form.Item>
                                    <a className='login-form-forgot' href='http://localhost:3001/login'>
                                        Forgot password
                                    </a>
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type='primary'
                                        htmlType='submit'
                                        className='login-form-button'
                                        onClick={this.loginUser}
                                    >
                                        Log in
                                    </Button>
                                    <p className='l-login__register'>
                                        Or <a href='http://localhost:3001/login'>register now!</a>
                                    </p>
                                </Form.Item>
                            </Form>
                        </div>
                    </Fragment>
                )}
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    isLoading: state.login.isLoading,
    error: state.login.error,
    isAuthenticated: state.login.token !== null,
    userType: state.login.userType,
});

const mapDispatchToProps = (dispatch) => ({
    handleLogIn: (email, password) =>
        dispatch(LogInThunkAction(email, password)),
});

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);
