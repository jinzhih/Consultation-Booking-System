import React, { useState, useRef, useEffect  } from 'react';
import { connect } from 'react-redux';
import JoditEditor from 'jodit-react';
import { Upload, message, Form, Input, Button, Select } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import Confirm from '../../UI/confirm/Confirm';
import { capitalize } from 'lodash';
import { fetchUserId } from '../../utils/authentication';
import BASE_URL from '../../constants/env';
import { BOOKING_TOPIC, BOOKING_TYPE } from '../../constants/option';
import './onlineBooking.scss';
import { fetchUserDetail } from '../../utils/api/user';

const layout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 16 },
};
const tailLayout = {
    wrapperCol: { offset: 4, span: 20 },
};
const { Option } = Select;
const { Dragger } = Upload;



const OnlineBooking = () => {
    const userId = fetchUserId();
    const [modalShow, setModalShow] = React.useState(false);
    const editor = useRef(null);
    const [content, setContent] = useState('');
    const [bookingDate] = useState(new Date());
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('');
    const [attachment, setAttachment] = useState([]);
    const [error, setError] = useState(null);
    const [campus, setCampus] = useState('');
    const config = {
        readonly: false,
    };
    
    const handleAttachmentbeforeUpload = file => {
        const isLt10M = file.size / 1024 / 1024 < 10;
        if (!isLt10M) {
            message.error('File size should not exceed 5M');
        }
        return new Promise((resolve, reject) => {
            if (!isLt10M) {
                reject(file);
            } else {
                resolve(file);
            }
        });
    };

    const fileProps = {
        name: 'file',
        multiple: true,
        accept: '.doc,.docx,.pdf,.xlsx.jpg.jpeg.png',  // Limit file type 
        action: `${BASE_URL}/bookings/upload`,
        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(
                    `${info.file.name} file uploaded successfully.`
                );
            } else if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        beforeUpload: (info) => handleAttachmentbeforeUpload(info),
    };

    const [onlineBookingForm] = Form.useForm();

    const onFinish = (values) => {
        setTopic(values.topic);
        setSubject(values.subject);
        console.log(values);
        if(values.attachment) {
            const files = [];
            values.attachment.forEach(file => {
                const res = file.response;
                files.push({
                    fileName: res.fileName,
                    fileLocation: res.fileLocation
                });
            });
            console.log(files);
            setAttachment(files);
        }
    };

    const onReset = () => {
        onlineBookingForm.resetFields();
    };

    const getFileList = (e) => {
        if(Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    };

    useEffect(() => {
     
        fetchUserDetail(userId).then(data => {
            console.log(data);
            setCampus(data.campus);
          
        }
        
    
        );
      
    
    },[]);

    return (
        <div className='online-booking'>
            <Confirm
                show={modalShow}
                type={BOOKING_TYPE.ONLINE}
                campus={campus}
                userId={userId}
                topic={topic}
                subject={subject}
                content={content}
                bookingDate={bookingDate}
                attachment={attachment}
                onHide={() => setModalShow(false)}
            />
            <div className='online-booking__title'>
                <h3>Online Consultation</h3>
            </div>
            <Form
                {...layout}
                name='onlineBookingForm'
                form={onlineBookingForm}
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
            >
                <Form.Item
                    name='topic'
                    label='Topic'
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please select your Topic!',
                        },
                    ]}
                >
                    <Select placeholder='Please select a topic'>
                        <Option value={BOOKING_TOPIC.FINANCE}>{capitalize(BOOKING_TOPIC.FINANCE)}</Option>
                        <Option value={BOOKING_TOPIC.ACCOMMODATION}>{capitalize(BOOKING_TOPIC.ACCOMMODATION)}</Option>
                        <Option value={BOOKING_TOPIC.COURSE}>{capitalize(BOOKING_TOPIC.COURSE)}</Option>
                        <Option value={BOOKING_TOPIC.OTHERS}>{capitalize(BOOKING_TOPIC.OTHERS)}</Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    label='Subject'
                    name='subject'
                    rules={[
                        {
                            required: true,
                            message: 'Please input your subject!',
                        },
                    ]}
                >
                    <Input placeholder='Type your subject' />
                </Form.Item>
                <Form.Item
                    label='Content'
                    name='content'
                    rules={[
                        {
                            required: true,
                            message: 'Please input your content!',
                        },
                    ]}
                >
                    <JoditEditor
                        ref={editor}
                        value={content}
                        config={config}
                        tabIndex={1} // tabIndex of textarea
                        onBlur={(newContent) => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
                    />
                </Form.Item>
                <Form.Item label='Attachment' name='attachment' valuePropName='fileList' 
                        getValueFromEvent={getFileList}>
                    <Dragger {...fileProps}>
                        <p className='ant-upload-drag-icon'>
                            <InboxOutlined />
                        </p>
                        <p className='ant-upload-text'>
                            Click or drag file to this area to upload
                        </p>
                        <p className='ant-upload-hint'>
                            You can only upload word，pdf and jpg format and size limitation 5M.
                        </p>
                    </Dragger>
                </Form.Item>
                <Form.Item {...tailLayout}>
                    <Button className='online-submit-btn'
                        type='primary'
                        htmlType='submit'
                        onClick={() => setModalShow(true)}
                    >
                        Submit
                    </Button>
                    <Button htmlType='button' className='online-reset-btn'onClick={onReset}>
                        Reset
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

const mapStateToProps = (state) => ({
    error: state.booking.error,
    campus: state.user.campus,
    isLoading: state.booking.isLoading,
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(OnlineBooking);