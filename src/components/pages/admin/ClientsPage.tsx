import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Dropdown, 
  Modal, 
  Form, 
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Upload,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { Client, addClient, updateClient, deleteClient } from '../../../store/slices/clientsSlice';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Search } = Input;

const ClientsPage: React.FC = () => {
  const dispatch = useDispatch();
  const { clients } = useSelector((state: RootState) => state.clients);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form] = Form.useForm();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchText.toLowerCase()) ||
    client.email.toLowerCase().includes(searchText.toLowerCase()) ||
    client.company.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleExcelUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        jsonData.forEach((row: any) => {
          const newClient: Client = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            name: row['Nom'] || row['Name'] || '',
            email: row['Email'] || '',
            phone: row['Téléphone'] || row['Phone'] || '',
            company: row['Entreprise'] || row['Company'] || '',
            address: row['Adresse'] || row['Address'] || '',
            createdAt: new Date().toISOString().split('T')[0],
            lastActivity: new Date().toISOString().split('T')[0],
            status: 'active',
            totalInvoices: 0,
            totalPaid: 0,
            totalPending: 0,
          };
          dispatch(addClient(newClient));
        });

        message.success(`${jsonData.length} clients importés avec succès`);
      } catch (error) {
        message.error('Erreur lors de l\'importation du fichier Excel');
      }
    };
    reader.readAsBinaryString(file);
    return false;
  };

  const columns = [
    {
      title: 'Client',
      key: 'client',
      render: (record: Client) => (
        <Space>
          <UserOutlined style={{ color: '#1890ff' }} />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.company}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (record: Client) => (
        <div>
          <div style={{ marginBottom: 4 }}>
            <MailOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
            <Text>{record.email}</Text>
          </div>
          <div>
            <PhoneOutlined style={{ marginRight: 8, color: '#8c8c8c' }} />
            <Text>{record.phone}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'CA Total',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString()} €
        </Text>
      ),
    },
    {
      title: 'En attente',
      dataIndex: 'totalPending',
      key: 'totalPending',
      render: (amount: number) => (
        <Text style={{ color: amount > 0 ? '#fa8c16' : '#8c8c8c' }}>
          {amount.toLocaleString()} €
        </Text>
      ),
    },
    {
      title: 'Dernière activité',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Client) => (
        <Dropdown
          overlay={
            <Space direction="vertical" size="small">
              <Button 
                type="text" 
                icon={<EyeOutlined />}
                onClick={() => console.log('Voir client', record.id)}
              >
                Voir
              </Button>
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingClient(record);
                  setModalVisible(true);
                  form.setFieldsValue(record);
                }}
              >
                Modifier
              </Button>
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Supprimer le client',
                    content: 'Êtes-vous sûr de vouloir supprimer ce client ?',
                    onOk: () => dispatch(deleteClient(record.id)),
                  });
                }}
              >
                Supprimer
              </Button>
            </Space>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const handleSubmit = (values: any) => {
    if (editingClient) {
      dispatch(updateClient({ ...editingClient, ...values }));
      message.success('Client mis à jour');
    } else {
      const newClient: Client = {
        ...values,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        lastActivity: new Date().toISOString().split('T')[0],
        status: 'active',
        totalInvoices: 0,
        totalPaid: 0,
        totalPending: 0,
      };
      dispatch(addClient(newClient));
      message.success('Client créé');
    }
    setModalVisible(false);
    setEditingClient(null);
    form.resetFields();
  };

  // Statistiques
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalPaid, 0);
  const averageRevenue = clients.length > 0 ? totalRevenue / clients.length : 0;

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Gestion des clients</Title>
        <Text type="secondary">Gérez votre portefeuille client</Text>
      </div>

      {/* Statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Total clients" 
              value={clients.length} 
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="Clients actifs" 
              value={activeClients} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="CA total" 
              value={totalRevenue} 
              suffix="€"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="CA moyen" 
              value={averageRevenue} 
              suffix="€"
              precision={0}
            />
          </Card>
        </Col>
      </Row>

      {/* Actions */}
      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="Rechercher un client..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Space>
            <Upload
              beforeUpload={handleExcelUpload}
              accept=".xlsx,.xls"
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>
                Importer Excel
              </Button>
            </Upload>
            
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingClient(null);
                setModalVisible(true);
                form.resetFields();
              }}
            >
              Nouveau client
            </Button>
          </Space>
        </Space>

        <Table
          dataSource={filteredClients}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} clients`,
          }}
        />
      </Card>

      {/* Modal de création/édition */}
      <Modal
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingClient(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
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
              <Form.Item
                name="phone"
                label="Téléphone"
                rules={[{ required: true, message: 'Le téléphone est requis' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company"
                label="Entreprise"
                rules={[{ required: true, message: 'L\'entreprise est requise' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Adresse"
            rules={[{ required: true, message: 'L\'adresse est requise' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClientsPage;