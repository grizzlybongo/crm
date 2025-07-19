import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  List, 
  Avatar, 
  Input, 
  Button, 
  Typography, 
  Badge,
  Space,
  Divider,
} from 'antd';
import {
  SendOutlined,
  UserOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { Message, addMessage, setActiveConversation } from '../../../store/slices/messagesSlice';

const { Title, Text } = Typography;
const { TextArea } = Input;

const MessagesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { messages, activeConversation } = useSelector((state: RootState) => state.messages);
  const { clients } = useSelector((state: RootState) => state.clients);
  const { user } = useSelector((state: RootState) => state.auth);
  const [newMessage, setNewMessage] = useState('');

  // Grouper les messages par conversation
  const conversations = clients.map(client => {
    const clientMessages = messages.filter(
      msg => msg.senderId === client.id || msg.receiverId === client.id
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const unreadCount = clientMessages.filter(
      msg => !msg.read && msg.senderId === client.id
    ).length;

    return {
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar || `https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?w=50&h=50&fit=crop&crop=face`,
      lastMessage: clientMessages[0],
      unreadCount,
      messages: clientMessages,
    };
  });

  const activeConversationData = conversations.find(
    conv => conv.clientId === activeConversation
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'admin',
      receiverId: activeConversation,
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    dispatch(addMessage(message));
    setNewMessage('');
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Messagerie</Title>
        <Text type="secondary">Communiquez avec vos clients</Text>
      </div>

      <Row gutter={16} style={{ height: '600px' }}>
        {/* Liste des conversations */}
        <Col span={8}>
          <Card 
            title="Conversations" 
            style={{ height: '100%' }}
            bodyStyle={{ padding: 0, height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            <List
              dataSource={conversations}
              renderItem={(conversation) => (
                <List.Item
                  style={{ 
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: activeConversation === conversation.clientId ? '#f0f8ff' : undefined,
                  }}
                  onClick={() => dispatch(setActiveConversation(conversation.clientId))}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge count={conversation.unreadCount} size="small">
                        <Avatar src={conversation.clientAvatar} icon={<UserOutlined />} />
                      </Badge>
                    }
                    title={conversation.clientName}
                    description={
                      conversation.lastMessage ? (
                        <Text ellipsis style={{ width: '200px' }}>
                          {conversation.lastMessage.content}
                        </Text>
                      ) : (
                        <Text type="secondary">Aucun message</Text>
                      )
                    }
                  />
                  {conversation.lastMessage && (
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(conversation.lastMessage.timestamp).toLocaleDateString()}
                    </Text>
                  )}
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Zone de chat */}
        <Col span={16}>
          {activeConversationData ? (
            <Card 
              title={
                <Space>
                  <Avatar 
                    src={activeConversationData.clientAvatar} 
                    icon={<UserOutlined />} 
                  />
                  <span>{activeConversationData.clientName}</span>
                </Space>
              }
              style={{ height: '100%' }}
              bodyStyle={{ 
                padding: 0, 
                height: 'calc(100% - 57px)', 
                display: 'flex', 
                flexDirection: 'column' 
              }}
            >
              {/* Messages */}
              <div style={{ 
                flex: 1, 
                padding: '16px', 
                overflowY: 'auto',
                backgroundColor: '#fafafa',
              }}>
                {activeConversationData.messages.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#8c8c8c' 
                  }}>
                    <MessageOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <br />
                    Aucun message encore
                  </div>
                ) : (
                  activeConversationData.messages
                    .slice()
                    .reverse()
                    .map((message) => (
                      <div
                        key={message.id}
                        className={`message-bubble ${
                          message.senderId === user?.id ? 'sent' : 'received'
                        }`}
                      >
                        <div>{message.content}</div>
                        <div style={{ 
                          fontSize: '11px', 
                          opacity: 0.7, 
                          marginTop: '4px' 
                        }}>
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Zone de saisie */}
              <div className="message-input">
                <TextArea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tapez votre message..."
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  type="primary" 
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                >
                  Envoyer
                </Button>
              </div>
            </Card>
          ) : (
            <Card style={{ height: '100%' }}>
              <div style={{ 
                textAlign: 'center', 
                padding: '40px',
                color: '#8c8c8c' 
              }}>
                <MessageOutlined style={{ fontSize: '64px', marginBottom: '16px' }} />
                <br />
                <Title level={4} type="secondary">
                  Sélectionnez une conversation
                </Title>
                <Text type="secondary">
                  Choisissez un client pour commencer à discuter
                </Text>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default MessagesPage;