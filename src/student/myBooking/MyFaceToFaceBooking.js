import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { Input, Descriptions, Comment, Avatar, Form, Button, List } from 'antd';
import BookingCard from './components/BookingCard';
import {
    fetchBookingDetailThunkAction,
    fetchBookingThunkAction,
} from '../../redux/actions/bookingAction';
import { fetchUserDetailThunkAction } from '../../redux/actions/userAction';
import { fetchUserId } from '../../utils/authentication';
import {
    addChat,
    updateChat,
    fetchAllChatByBookingId,
} from '../../utils/api/booking';
import { DownloadOutlined } from '@ant-design/icons';
import './styles/myFaceToFaceBooking.scss';

const { TextArea } = Input;

const CommentList = ({ comments }) => (
    <List
        dataSource={comments}
        header={`${comments.length} ${
            comments.length > 1 ? 'replies' : 'reply'
        }`}
        itemLayout='horizontal'
        renderItem={(props) => <Comment {...props} />}
    />
);

const Editor = ({ onChange, onSubmit, submitting, value }) => (
    <div>
        <Form.Item>
            <TextArea rows={4} onChange={onChange} value={value} />
        </Form.Item>
        <Form.Item>
            <Button
                htmlType='submit'
                loading={submitting}
                onClick={onSubmit}
                type='primary'
            >
                Add Comment
            </Button>
        </Form.Item>
    </div>
);

class MyFaceToFaceBooking extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            submitting: false,
            value: '',
            activeCard: false,
            currentBookingId: '',
            error: null,
            isLoading: false,
            comments: {},
            chatId: '',
            originalChat: [], //chatRecord in database
            chatRecords: [], //chatRecord for frontend
        };
    }

    componentDidMount() {
        this.getMyBooking();
    }

    getMyBooking = () => {
        const { fetchMyBooking, fetchUserDetail } = this.props;
        const userId = fetchUserId();
        fetchMyBooking(userId);
        this.setState({ userId }, () => {
            fetchUserDetail(userId);
        });
    };

    transChatRecords = (chat) => {
        if (chat) {
            const chatId = chat._id;
            const originalChat = chat.chatRecords;
            const chatRecords = [];
            originalChat.forEach((record) => {
                const { author, content, time } = record;
                const authorName = `${author.firstName} ${author.lastName}`;

                const newChat = {
                    author: authorName,
                    avatar:
                        'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                    content,
                    datetime: moment(time).fromNow(),
                };
                chatRecords.push(newChat);
            });
            const newChat = { chatId, originalChat, chatRecords };
            return newChat;
        } else {
            const chatId = '';
            const originalChat = '';
            const chatRecords = [];
            const newChat = { chatId, originalChat, chatRecords };
            return newChat;
        }
    };

    handleClickBooking = (bookingId) => {
        const { getBookingDetail } = this.props;
        getBookingDetail(bookingId);
        fetchAllChatByBookingId(bookingId)
            .then((chat) => {
                const newChat = this.transChatRecords(chat);
                const { chatId, originalChat, chatRecords } = newChat;
                this.setState({ chatId, originalChat, chatRecords });
            })
            .catch((error) => {
                this.setState({ error, isLoading: false });
            });
        this.setState({ activeCard: true, currentBookingId: bookingId });
    };

    handleSubmit = () => {
        if (!this.state.value) {
            return;
        }
        this.setState({ submitting: true });
        setTimeout(() => {
            const {
                chatId,
                originalChat,
                userId,
                currentBookingId,
                value,
            } = this.state;
            const { firstName, lastName } = this.props;
            const author = `${firstName} ${lastName}`;
            console.log(author);
            this.setState(
                {
                    submitting: false,
                    chatRecords: [
                        {
                            author: 'me',
                            avatar:
                                'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
                            content: value,
                            datetime: moment().fromNow(),
                        },
                        ...this.state.chatRecords,
                    ],
                },
                () => {
                    //const { currentBookingId, value } = this.state;
                    const Msg = {
                        author: userId,
                        content: value,
                        time: new Date(),
                    };
                    if (!chatId) {
                        const newchatRecords = [Msg];
                        const chat = {
                            bookingId: currentBookingId,
                            studentId: userId,
                            chatRecords: newchatRecords,
                        };
                        addChat(chat)
                            .then((data) => {
                                if (data) {
                                    const newChat = this.transChatRecords(data);
                                    const {
                                        chatId,
                                        originalChat,
                                        chatRecords,
                                    } = newChat;
                                    this.setState({
                                        chatId,
                                        originalChat,
                                        chatRecords,
                                    });
                                }
                            })
                            .catch((error) =>
                                this.setState({ error, isLoading: false })
                            );
                    } else {
                        const records = [];
                        originalChat.forEach((record) => {
                            let { author, content, time } = record;

                            time = new Date(time);
                            const item = {
                                author,
                                content,
                                time,
                            };
                            records.push(item);
                        });
                        records.push(Msg);
                        updateChat(chatId, records)
                            .then((data) => {
                                if (data) {
                                    const newChat = this.transChatRecords(data);
                                    const {
                                        chatId,
                                        originalChat,
                                        chatRecords,
                                    } = newChat;
                                    this.setState({
                                        chatId,
                                        originalChat,
                                        chatRecords,
                                    });
                                }
                            })
                            .catch((error) =>
                                this.setState({ error, isLoading: false })
                            );
                    }
                }
            );
            this.setState({
                value: '',
            });
        }, 1000);
    };

    handleChange = (e) => {
        this.setState({
            value: e.target.value,
        });
    };

    renderBookingDetail = (bookingDetail) => {
        const { chatRecords, submitting, value } = this.state;
        const {
            _id,
            status,
            campus,
            userId,
            topic,
            subject,
            content,
            bookingDate,
            attachment,
        } = bookingDetail;
        const date = moment(bookingDate).format('MMMM Do YYYY, h:mm:ss');

        return (
            <div>
                <h3>{`Booking Number - ${_id}`}</h3>
                <Descriptions
                    bordered
                    column={{
                        xxl: 3,
                        xl: 3,
                        lg: 3,
                        md: 3,
                        sm: 2,
                        xs: 1,
                    }}
                >
                    <Descriptions.Item label='Name'>
                        {userId ? `${userId.firstName} ${userId.lastName}` : ''}
                    </Descriptions.Item>
                    <Descriptions.Item label='Campus'>
                        {campus}
                    </Descriptions.Item>
                    <Descriptions.Item label='Booking Date'>
                        {date}
                    </Descriptions.Item>
                    <Descriptions.Item label='Topic'>{topic}</Descriptions.Item>
                    <Descriptions.Item label='Subject'>
                        {subject}
                    </Descriptions.Item>
                    <Descriptions.Item label='Status'>
                        {status}
                    </Descriptions.Item>
                    <Descriptions.Item label='Content' span={3}>
                        {content}
                    </Descriptions.Item>
                    <Descriptions.Item label='Attachment'>
                        {attachment
                            ? attachment.map((item) => {
                                  const { _id, fileName, fileLocation } = item;
                                  return (
                                      <div key={_id} className='l-download'>
                                          <p>{fileName}</p>
                                          <Button
                                              type='primary'
                                              icon={<DownloadOutlined />}
                                              size='small'
                                              target='_blank'
                                              download
                                              href={fileLocation}
                                          >
                                              Download
                                          </Button>
                                      </div>
                                  );
                              })
                            : null}
                    </Descriptions.Item>
                </Descriptions>
                <div>
                    {chatRecords.length > 0 && (
                        <CommentList comments={chatRecords} />
                    )}
                    <div>
                        <div className='c-comment__header'>2 replies</div>
                        <div className='c-comment__body'>
                            <div className='c-comment__block'>
                                <div className='c-comment__avatar'>
                                    <img
                                        src='https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
                                        alt='Han Solo'
                                    />
                                </div>
                                <div className='c-comment__content'>
                                    <div className='c-comment__author'>
                                        <span className='c-comment__name'>
                                            Eew Zod
                                        </span>
                                        <span className='c-comment__time'>
                                            an hour ago
                                        </span>
                                    </div>
                                    <div className='c-comment__detail'>
                                        gregredfger个人个人
                                    </div>
                                </div>
                            </div>
                            <div className='c-comment__block'>
                                <div className='c-comment__avatar'>
                                    <img
                                        src='https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
                                        alt='Han Solo'
                                    />
                                </div>
                                <div className='c-comment__content'>
                                    <div className='c-comment__author'>
                                        <span className='c-comment__name'>
                                            Eew Zod
                                        </span>
                                        <span className='c-comment__time'>
                                            an hour ago
                                        </span>
                                    </div>
                                    <div className='c-comment__detail'>
                                        gregredfger个人个人
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Comment
                        avatar={
                            <Avatar
                                src='https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png'
                                alt='Han Solo'
                            />
                        }
                        content={
                            <Editor
                                onChange={this.handleChange}
                                onSubmit={this.handleSubmit}
                                submitting={submitting}
                                value={value}
                            />
                        }
                    />
                </div>
            </div>
        );
    };

    render() {
        const { bookings, bookingDetail } = this.props;
        const { activeCard } = this.state;

        const { Search } = Input;
        const myOfflineBookings = bookings.filter((booking) => {
            return booking.type === 'Offline';
        });

        return (
            <main className='mybooking'>
                <section className='mybooking__left'>
                    <h2 className='mybooking__title'>Booking List</h2>
                    <Search
                        placeholder='input search text'
                        onSearch={(value) => console.log(value)}
                        enterButton='Search'
                        size='large'
                    />
                    <div className='list-group'>
                        {myOfflineBookings.length
                            ? myOfflineBookings.map((booking) => {
                                  return (
                                      <BookingCard
                                          key={booking._id}
                                          bookingId={booking._id}
                                          firstName={booking.userId.firstName}
                                          lastName={booking.userId.lastName}
                                          subject={booking.subject}
                                          status={booking.status}
                                          handleClickBooking={
                                              this.handleClickBooking
                                          }
                                      />
                                  );
                              })
                            : null}
                    </div>
                </section>
                <section className='mybooking__right'>
                    <div className='tab-content'>
                        {bookingDetail && activeCard
                            ? this.renderBookingDetail(bookingDetail)
                            : null}
                    </div>
                </section>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    bookings: state.booking.bookings,
    bookingDetail: state.booking.bookingDetail,
    firstName: state.user.firstName,
    lastName: state.user.lastName,
});

const mapDispatchToProps = (dispatch) => ({
    getBookingDetail: (bookingId) =>
        dispatch(fetchBookingDetailThunkAction(bookingId)),
    fetchMyBooking: (userId) => dispatch(fetchBookingThunkAction(userId)),
    fetchUserDetail: (userId) => dispatch(fetchUserDetailThunkAction(userId)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MyFaceToFaceBooking);
