import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, message, Divider, Alert, Checkbox, Avatar } from 'antd';
import { LockOutlined, CrownOutlined, UserAddOutlined, EyeInvisibleOutlined, EyeTwoTone, MailOutlined, SafetyOutlined, ThunderboltOutlined, GlobalOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginStart, loginSuccess } from '../../store/slices/authSlice';

const { Title, Text, Paragraph } = Typography;

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

const LoginPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [showLoginAnimation, setShowLoginAnimation] = useState(false);

  // Add visual animation effect on load
  useEffect(() => {
    const timer = setTimeout(() => {
      const decorElements = document.querySelectorAll('.decor-element');
      decorElements.forEach((el, index) => {
        setTimeout(() => {
          (el as HTMLElement).style.opacity = '1';
          (el as HTMLElement).style.transform = 'translateY(0) scale(1)';
        }, index * 150);
      });
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    dispatch(loginStart());
    setShowLoginAnimation(true);
    setError(''); // Clear any previous errors
    
    // Simulation d'authentification
    setTimeout(() => {
      let user;
      if (values.email === 'admin@erp.com') {
        user = {
          id: 'admin',
          email: 'admin@erp.com',
          name: 'Administrateur',
          role: 'admin' as const,
          company: 'ERP Solutions',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=100&h=100&fit=crop&crop=face',
        };
      } else {
        user = {
          id: '1',
          email: 'jean.dupont@email.com',
          name: 'Jean Dupont',
          role: 'client' as const,
          company: 'Tech Solutions SAS',
          avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?w=100&h=100&fit=crop&crop=face',
        };
      }

      const token = 'mock-jwt-token';
      
      // Save remember me preference
      if (values.remember) {
        localStorage.setItem('rememberUser', 'true');
      } else {
        localStorage.removeItem('rememberUser');
      }
      
      dispatch(loginSuccess({ user, token }));
      
      message.success({
        content: `Bienvenue ${user.name} !`,
        icon: <Avatar src={user.avatar} size={24} style={{ marginRight: 8 }} />,
        className: 'custom-success-message'
      });
      
      // Redirection avec un petit délai pour l'UX
      setTimeout(() => {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard', { replace: true });
      }, 500);
      
      setLoading(false);
      setShowLoginAnimation(false);
    }, 1500);
  };

  const loginAsAdmin = () => {
    form.setFieldsValue({ email: 'admin@erp.com', password: 'admin123', remember: true });
    onFinish({ email: 'admin@erp.com', password: 'admin123', remember: true });
  };

  const loginAsClient = () => {
    form.setFieldsValue({ email: 'jean.dupont@email.com', password: 'client123', remember: true });
    onFinish({ email: 'jean.dupont@email.com', password: 'client123', remember: true });
  };

  const features = [
    {
      icon: <SafetyOutlined className="text-teal-600" />,
      title: "Sécurisé",
      description: "Chiffrement de bout en bout"
    },
    {
      icon: <ThunderboltOutlined className="text-blue-600" />,
      title: "Performant",
      description: "Interface ultra-rapide"
    },
    {
      icon: <GlobalOutlined className="text-purple-600" />,
      title: "Accessible",
      description: "Disponible partout, tout le temps"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-teal-400/30 to-blue-400/30 rounded-full blur-3xl animate-pulse decor-element" 
             style={{ opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.8s ease-out' }}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse decor-element" 
             style={{ animationDelay: '1s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.8s ease-out' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-teal-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse decor-element" 
             style={{ animationDelay: '2s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.8s ease-out' }}></div>
        
        {/* Additional decorative elements */}
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-gradient-to-r from-yellow-300/10 to-orange-300/10 rounded-full blur-3xl animate-pulse decor-element"
             style={{ animationDelay: '1.5s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.8s ease-out' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-pink-300/10 to-purple-300/10 rounded-full blur-3xl animate-pulse decor-element"
             style={{ animationDelay: '0.7s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.8s ease-out' }}></div>
      </div>

      {/* Enhanced floating elements */}
      <div className="absolute top-20 left-20 w-4 h-4 bg-teal-400 rounded-full animate-float opacity-80 decor-element" 
           style={{ animationDuration: '6s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.6s ease-out' }}></div>
      <div className="absolute top-40 right-32 w-3 h-3 bg-blue-400 rounded-full animate-float opacity-80 decor-element" 
           style={{ animationDuration: '8s', animationDelay: '1s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.6s ease-out' }}></div>
      <div className="absolute bottom-32 left-40 w-2 h-2 bg-purple-400 rounded-full animate-float opacity-80 decor-element" 
           style={{ animationDuration: '7s', animationDelay: '2s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.6s ease-out' }}></div>
      <div className="absolute top-1/3 right-20 w-3 h-3 bg-yellow-400 rounded-full animate-float opacity-80 decor-element" 
           style={{ animationDuration: '9s', animationDelay: '0.5s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.6s ease-out' }}></div>
      <div className="absolute bottom-1/4 left-20 w-2 h-2 bg-pink-400 rounded-full animate-float opacity-80 decor-element" 
           style={{ animationDuration: '5s', animationDelay: '1.5s', opacity: 0, transform: 'translateY(40px) scale(0.9)', transition: 'all 0.6s ease-out' }}></div>

      {/* Enhanced Retour à l'accueil button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/">
          <Button 
            type="text" 
            className="text-teal-600 hover:text-teal-700 font-medium flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-md rounded-full shadow-md hover:shadow-lg transition-all duration-300"
          >
            <span>← Retour à l'accueil</span>
          </Button>
        </Link>
      </div>

      {/* Login animation overlay */}
      {showLoginAnimation && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm z-50 transition-opacity duration-300">
          <div className="bg-white/90 rounded-3xl p-10 flex flex-col items-center shadow-2xl animate-bounce-in">
            <div className="w-20 h-20 mb-6 relative">
              <div className="absolute inset-0 bg-teal-500 rounded-full animate-ping opacity-20"></div>
              <div className="absolute inset-0 bg-teal-500 rounded-full animate-pulse opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CrownOutlined className="text-4xl text-teal-600" />
              </div>
            </div>
            <Title level={3} className="!text-gray-800 !mb-4">Connexion en cours...</Title>
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-5 gap-16 items-center relative z-10">
        {/* Left side - Branding and features */}
        <div className="hidden lg:block lg:col-span-3 space-y-10 animate-fade-in pr-8">
          {/* Main branding section */}
          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <CrownOutlined className="text-white text-3xl" />
              </div>
              <div>
                <Title level={1} className="!text-5xl !font-bold !text-gray-800 !mb-3 !leading-tight">
                  ERP Pro
                </Title>
                <div className="flex items-center">
                  <Text className="text-xl text-gray-600 font-medium">
                    Solution de gestion d'entreprise nouvelle génération
                  </Text>
                  <span className="ml-3 px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">
                    Version 2.0
                  </span>
                </div>
              </div>
            </div>
            
            <Paragraph className="text-2xl text-gray-700 leading-relaxed font-light max-w-2xl">
              Transformez votre façon de gérer votre entreprise avec une solution complète, 
              intuitive et puissante. Factures, clients, paiements et bien plus encore.
            </Paragraph>
          </div>

          {/* Enhanced Features grid */}
          <div className="grid grid-cols-1 gap-6 max-w-2xl">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-6 p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <div>
                  <Text strong className="text-gray-800 text-xl block mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-gray-600 text-base">
                    {feature.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Stats section */}
          <div className="grid grid-cols-3 gap-8 pt-8 max-w-2xl">
            <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-colors duration-300 shadow-md hover:shadow-lg">
              <div className="text-4xl font-bold text-teal-600 mb-2 relative inline-block">
                <span className="relative z-10">500+</span>
                <span className="absolute -inset-1 bg-teal-100 rounded-lg -z-0 opacity-30"></span>
              </div>
              <div className="text-gray-600 font-medium">Entreprises</div>
            </div>
            <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-colors duration-300 shadow-md hover:shadow-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2 relative inline-block">
                <span className="relative z-10">99.9%</span>
                <span className="absolute -inset-1 bg-blue-100 rounded-lg -z-0 opacity-30"></span>
              </div>
              <div className="text-gray-600 font-medium">Disponibilité</div>
            </div>
            <div className="text-center p-4 bg-white/50 backdrop-blur-sm rounded-2xl hover:bg-white/70 transition-colors duration-300 shadow-md hover:shadow-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2 relative inline-block">
                <span className="relative z-10">24/7</span>
                <span className="absolute -inset-1 bg-purple-100 rounded-lg -z-0 opacity-30"></span>
              </div>
              <div className="text-gray-600 font-medium">Support</div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="lg:col-span-2 w-full max-w-lg mx-auto animate-slide-in">
          <Card 
            className="shadow-2xl border-0 backdrop-blur-md bg-white/95 transform hover:scale-[1.02] transition-transform duration-300"
            style={{ 
              borderRadius: '32px',
              overflow: 'hidden',
            }}
          >
            {/* Enhanced Header */}
            <div className="text-center mb-10 p-8 -m-8 bg-gradient-to-br from-teal-500 via-teal-600 to-blue-600 text-white relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse"></div>
              </div>
              
              <div className="relative z-10">
                <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm shadow-xl">
                  <CrownOutlined className="text-4xl text-white" />
                </div>
                <Title level={2} className="!text-white !mb-3 !text-3xl !font-bold">
                  Connexion
                </Title>
                <Text className="text-teal-100 text-lg font-medium">
                  Accédez à votre espace de gestion
                </Text>
              </div>
            </div>

            <div className="px-8 pb-8">
              <Form
                form={form}
                name="login"
                onFinish={onFinish}
                layout="vertical"
                size="large"
                validateTrigger="onSubmit"
                preserve={false}
                initialValues={{ remember: true }}
                onFinishFailed={() => {
                  setError('Veuillez vérifier vos informations de connexion');
                  setLoading(false);
                }}
                className="space-y-6"
              >
                <Form.Item
                  label={<span className="text-gray-700 font-semibold text-base">Adresse email</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Veuillez saisir votre email' },
                    { type: 'email', message: 'Format email invalide' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined className="text-gray-400 text-lg" />} 
                    placeholder="admin@erp.com ou jean.dupont@email.com"
                    className="rounded-2xl border-2 border-gray-200 hover:border-teal-400 focus:border-teal-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    style={{ height: '56px', fontSize: '16px' }}
                  />
                </Form.Item>

                <Form.Item
                  label={<span className="text-gray-700 font-semibold text-base">Mot de passe</span>}
                  name="password"
                  rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
                >
                  <Input.Password 
                    prefix={<LockOutlined className="text-gray-400 text-lg" />} 
                    placeholder="Votre mot de passe"
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                    className="rounded-2xl border-2 border-gray-200 hover:border-teal-400 focus:border-teal-500 transition-all duration-300 shadow-sm hover:shadow-md"
                    style={{ height: '56px', fontSize: '16px' }}
                  />
                </Form.Item>

                {error && (
                  <Form.Item>
                    <Alert 
                      message={error} 
                      type="error" 
                      showIcon 
                      closable 
                      onClose={() => setError('')}
                      className="rounded-xl animate-shake" 
                    />
                  </Form.Item>
                )}

                <div className="flex justify-between items-center py-2">
                  <Form.Item name="remember" valuePropName="checked" noStyle>
                    <Checkbox className="font-medium text-gray-600">Se souvenir de moi</Checkbox>
                  </Form.Item>
                  <Button type="link" className="p-0 text-teal-600 hover:text-teal-700 font-medium">
                    Mot de passe oublié ?
                  </Button>
                </div>

                <Form.Item className="mb-8">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    block
                    className="h-14 rounded-2xl font-bold text-lg bg-gradient-to-r from-teal-500 to-teal-600 border-0 hover:from-teal-600 hover:to-teal-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? 'Connexion en cours...' : 'Se connecter'}
                  </Button>
                </Form.Item>
              </Form>

              <Divider className="!text-gray-400 !text-sm !my-8">
                <span className="bg-white px-6 text-gray-500 font-medium">Accès rapide démo</span>
              </Divider>
              
              <div className="grid grid-cols-1 gap-4 mt-8">
                <Button 
                  icon={<CrownOutlined />} 
                  onClick={loginAsAdmin}
                  loading={loading}
                  className="h-14 rounded-2xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 font-semibold transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-[1.02]"
                >
                  <span>Connexion Administrateur</span>
                </Button>
                <Button 
                  icon={<UserAddOutlined />} 
                  onClick={loginAsClient}
                  loading={loading}
                  className="h-14 rounded-2xl border-2 border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 font-semibold transition-all duration-300 flex items-center justify-center space-x-3 transform hover:scale-[1.02]"
                >
                  <span>Connexion Client</span>
                </Button>
              </div>
                
            </div>
          </Card>

          {/* Mobile branding */}
          <div className="lg:hidden text-center mt-10 space-y-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                <CrownOutlined className="text-white text-2xl" />
              </div>
              <div>
                <Title level={2} className="!text-gray-800 !mb-1 !text-3xl">ERP Pro</Title>
                <Text className="text-gray-600 text-lg">Solution de gestion</Text>
              </div>
            </div>
            
            {/* Mobile features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-white/30 shadow-md">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                    {feature.icon}
                  </div>
                  <Text strong className="text-gray-800 text-sm block">
                    {feature.title}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <Text className="text-gray-500 text-sm font-medium">
          © 2024 ERP Pro. Tous droits réservés. | 
          <span className="text-teal-600 ml-1 cursor-pointer hover:text-teal-700 hover:underline">
            Politique de confidentialité
          </span>
        </Text>
      </div>
    </div>
  );
};

export default LoginPage;
