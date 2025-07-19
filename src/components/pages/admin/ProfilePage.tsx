import React, { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col, Typography, Divider } from 'antd';
import { UserOutlined, CameraOutlined, SaveOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Profil mis à jour avec succès');
    } catch (error) {
      message.error('Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      message.success('Photo de profil mise à jour');
    }
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Mon profil</Title>
        <Text type="secondary">Gérez vos informations personnelles</Text>
      </div>

      <Row gutter={24}>
        <Col span={8}>
          <Card title="Photo de profil" className="text-center">
            <div className="mb-4">
              <Avatar 
                size={120} 
                src={user?.avatar} 
                icon={<UserOutlined />}
                className="mb-4"
              />
            </div>
            <Upload
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleAvatarChange}
            >
              <Button icon={<CameraOutlined />}>
                Changer la photo
              </Button>
            </Upload>
          </Card>

          <Card title="Informations du compte" className="mt-4">
            <div className="space-y-3">
              <div>
                <Text type="secondary">Rôle</Text>
                <br />
                <Text strong>Administrateur</Text>
              </div>
              <div>
                <Text type="secondary">Statut</Text>
                <br />
                <Text strong className="text-green-600">Actif</Text>
              </div>
              <div>
                <Text type="secondary">Dernière connexion</Text>
                <br />
                <Text>Aujourd'hui, 09:30</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={16}>
          <Card title="Informations personnelles">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                name: user?.name,
                email: user?.email,
                company: user?.company,
                phone: user?.phone || '',
                address: user?.address || '',
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="Nom complet"
                    rules={[{ required: true, message: 'Le nom est requis' }]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'L\'email est requis' },
                      { type: 'email', message: 'Format email invalide' }
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="company" label="Entreprise">
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="phone" label="Téléphone">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="address" label="Adresse">
                <Input.TextArea rows={3} />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  Sauvegarder les modifications
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;