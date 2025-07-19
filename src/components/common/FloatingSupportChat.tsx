import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Input, 
  Typography, 
  Space,
  Avatar,
  Badge,
  Tooltip,
  Divider,
  Tag,
} from 'antd';
import {
  CustomerServiceOutlined,
  SendOutlined,
  CloseOutlined,
  MessageOutlined,
  PhoneOutlined,
  MailOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  UserOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { Message, addMessage } from '../../store/slices/messagesSlice';

const { Text, Title } = Typography;
const { TextArea } = Input;

const FloatingSupportChat: React.FC = () => {
  const dispatch = useDispatch();
  const { messages } = useSelector((state: RootState) => state.messages);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(true);

  // Simulate online/offline status
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineStatus(Math.random() > 0.1); // 90% chance of being online
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filtrer les messages pour le client connecté
  const clientMessages = messages.filter(
    msg => msg.senderId === user?.id || msg.receiverId === user?.id
  ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Compter les messages non lus
  const unreadCount = messages.filter(
    msg => !msg.read && msg.receiverId === user?.id
  ).length;

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      receiverId: 'admin',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    dispatch(addMessage(message));
    setNewMessage('');

    // Simulate typing indicator and auto-response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const autoResponse: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'admin',
        receiverId: user?.id || '',
        content: 'Merci pour votre message ! Un membre de notre équipe vous répondra dans les plus brefs délais.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text',
      };
      dispatch(addMessage(autoResponse));
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: <QuestionCircleOutlined />, text: 'FAQ', action: () => console.log('FAQ') },
    { icon: <PhoneOutlined />, text: 'Appeler', action: () => console.log('Call') },
    { icon: <MailOutlined />, text: 'Email', action: () => console.log('Email') },
  ];

  const quickMessages = [
    'J\'ai une question sur ma facture',
    'Je souhaite modifier mon contrat',
    'Problème technique',
    'Demande de devis',
  ];

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-6 z-50 transition-all duration-300 ease-in-out transform ${
            isMinimized ? 'scale-95 opacity-90' : 'scale-100 opacity-100'
          }`}
          style={{
            width: '380px',
            height: isMinimized ? '60px' : '520px',
            filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))',
          }}
        >
          <Card
            style={{
              height: '100%',
              borderRadius: '16px',
              overflow: 'hidden',
              border: 'none',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            }}
            bodyStyle={{ 
              padding: 0, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column' 
            }}
          >
            {/* Header */}
            <div style={{ 
              padding: '16px 20px',
              background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Background decoration */}
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-20%',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                transform: 'rotate(45deg)',
              }} />
              
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar 
                      size={40} 
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                      }}
                      icon={<CustomerServiceOutlined />} 
                    />
                    <div 
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        onlineStatus ? 'bg-green-400' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-lg">Support Client</div>
                    <div className="text-teal-100 text-sm flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${onlineStatus ? 'bg-green-300' : 'bg-gray-300'}`} />
                      <span>{onlineStatus ? 'En ligne' : 'Hors ligne'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="text" 
                    size="small"
                    icon={<MinusOutlined />}
                    onClick={() => setIsMinimized(!isMinimized)}
                    style={{ color: 'white' }}
                    className="hover:bg-white hover:bg-opacity-20 rounded-lg"
                  />
                  <Button 
                    type="text" 
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => setIsOpen(false)}
                    style={{ color: 'white' }}
                    className="hover:bg-white hover:bg-opacity-20 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div style={{ 
                  flex: 1, 
                  padding: '20px', 
                  overflowY: 'auto',
                  backgroundColor: '#f8fafc',
                  maxHeight: '320px',
                  background: 'linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%)',
                }}>
                  {clientMessages.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '30px 20px',
                      color: '#64748b' 
                    }}>
                      <div className="mb-4">
                        <RobotOutlined style={{ fontSize: '48px', color: '#0d9488' }} />
                      </div>
                      <Title level={4} style={{ color: '#1e293b', margin: '0 0 8px 0' }}>
                        Bonjour {user?.name} ! 👋
                      </Title>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        Comment puis-je vous aider aujourd'hui ?
                      </Text>
                      
                      {/* Quick message buttons */}
                      <div className="mt-4 space-y-2">
                        {quickMessages.slice(0, 2).map((msg, index) => (
                          <Button
                            key={index}
                            size="small"
                            block
                            onClick={() => setNewMessage(msg)}
                            style={{
                              textAlign: 'left',
                              height: 'auto',
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              background: 'white',
                              color: '#475569',
                              fontSize: '12px',
                            }}
                            className="hover:border-teal-300 hover:bg-teal-50"
                          >
                            {msg}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {clientMessages.map((message) => (
                        <div
                          key={message.id}
                          style={{
                            marginBottom: '16px',
                            display: 'flex',
                            justifyContent: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                          }}
                        >
                          <div
                            style={{
                              maxWidth: '85%',
                              padding: '12px 16px',
                              borderRadius: '16px',
                              backgroundColor: message.senderId === user?.id ? '#0d9488' : '#ffffff',
                              color: message.senderId === user?.id ? '#ffffff' : '#1e293b',
                              borderBottomRightRadius: message.senderId === user?.id ? '4px' : '16px',
                              borderBottomLeftRadius: message.senderId === user?.id ? '16px' : '4px',
                              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              border: message.senderId !== user?.id ? '1px solid #e2e8f0' : 'none',
                              position: 'relative',
                            }}
                          >
                            {message.senderId !== user?.id && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Avatar size={20} icon={<UserOutlined />} />
                                <Text style={{ fontSize: '11px', color: '#64748b' }}>
                                  Support
                                </Text>
                              </div>
                            )}
                            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                              {message.content}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              opacity: 0.7, 
                              marginTop: '6px',
                              textAlign: 'right',
                            }}>
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Typing indicator */}
                      {isTyping && (
                        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
                          <div style={{
                            padding: '12px 16px',
                            borderRadius: '16px',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          }}>
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              </div>
                              <Text style={{ fontSize: '11px', color: '#64748b', marginLeft: '8px' }}>
                                En train d'écrire...
                              </Text>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Quick Actions */}
                <div style={{ padding: '12px 20px 0', backgroundColor: '#ffffff' }}>
                  <div className="flex justify-center space-x-3">
                    {quickActions.map((action, index) => (
                      <Tooltip key={index} title={action.text}>
                        <Button
                          size="small"
                          icon={action.icon}
                          onClick={action.action}
                          style={{
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            color: '#64748b',
                          }}
                          className="hover:border-teal-300 hover:text-teal-600"
                        />
                      </Tooltip>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div style={{ 
                  padding: '16px 20px', 
                  borderTop: '1px solid #f1f5f9',
                  backgroundColor: '#ffffff',
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                    <TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      autoSize={{ minRows: 1, maxRows: 3 }}
                      onKeyPress={handleKeyPress}
                      style={{ 
                        resize: 'none',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        fontSize: '14px',
                      }}
                      className="focus:border-teal-400 focus:shadow-sm"
                    />
                    <Button 
                      type="primary" 
                      icon={<SendOutlined />}
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      style={{ 
                        borderRadius: '12px',
                        height: '40px',
                        width: '40px',
                        background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                        border: 'none',
                        boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)',
                      }}
                      className="hover:shadow-lg transition-all duration-200"
                    />
                  </div>
                  
                  <div style={{ marginTop: '8px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '11px', color: '#94a3b8' }}>
                      Appuyez sur Entrée pour envoyer
                    </Text>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      )}

      {/* Enhanced Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <Tooltip 
          title={
            <div className="text-center">
              <div className="font-medium">Besoin d'aide ?</div>
              <div className="text-xs opacity-75">Notre équipe est là pour vous</div>
            </div>
          } 
          placement="left"
        >
          <Badge count={unreadCount} size="small" offset={[-8, 8]}>
            <Button
              type="primary"
              shape="circle"
              size="large"
              icon={isOpen ? <MessageOutlined /> : <CustomerServiceOutlined />}
              onClick={() => setIsOpen(!isOpen)}
              style={{
                width: '64px',
                height: '64px',
                border: 'none',
                fontSize: '24px',
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
                boxShadow: '0 8px 32px rgba(13, 148, 136, 0.4)',
                position: 'relative',
                overflow: 'hidden',
              }}
              className="hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95"
            >
              {/* Pulse animation for unread messages */}
              {unreadCount > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.3)',
                    animation: 'pulse 2s infinite',
                  }}
                />
              )}
              
              {/* Online indicator */}
              {onlineStatus && (
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.3)',
                  }}
                />
              )}
            </Button>
          </Badge>
        </Tooltip>
      </div>

      {/* Custom styles */}
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-30px,0);
          }
          70% {
            transform: translate3d(0,-15px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingSupportChat;