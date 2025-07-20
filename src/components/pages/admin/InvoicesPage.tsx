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
  Select,
  DatePicker,
  InputNumber,
  Divider,
  message,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  FileTextOutlined,
  SendOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../store';
import { Invoice, InvoiceItem, addInvoice, updateInvoice, deleteInvoice } from '../../../store/slices/invoicesSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const InvoicesPage: React.FC = () => {
  const dispatch = useDispatch();
  const { invoices } = useSelector((state: RootState) => state.invoices);
  const { clients } = useSelector((state: RootState) => state.clients);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form] = Form.useForm();

  const filteredInvoices = invoices.filter(invoice =>
    invoice.number.toLowerCase().includes(searchText.toLowerCase()) ||
    invoice.clientName.toLowerCase().includes(searchText.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'default',
      sent: 'blue',
      paid: 'green',
      overdue: 'red',
      cancelled: 'red',
    };
    return colors[status as keyof typeof colors];
  };

  const getStatusText = (status: string) => {
    const texts = {
      draft: 'Brouillon',
      sent: 'Envoyée',
      paid: 'Payée',
      overdue: 'En retard',
      cancelled: 'Annulée',
    };
    return texts[status as keyof typeof texts];
  };

  const columns = [
    {
      title: 'Numéro',
      dataIndex: 'number',
      key: 'number',
      render: (number: string) => (
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <Text strong>{number}</Text>
        </Space>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'clientName',
      key: 'clientName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Échéance',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Montant',
      dataIndex: 'total',
      key: 'total',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {amount.toLocaleString()} TND
        </Text>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: Invoice) => (
        <Dropdown
          overlay={
            <Space direction="vertical" size="small">
              <Button type="text" icon={<EyeOutlined />}>
                Voir
              </Button>
              <Button 
                type="text" 
                icon={<EditOutlined />}
                onClick={() => {
                  setEditingInvoice(record);
                  setModalVisible(true);
                  form.setFieldsValue({
                    ...record,
                    date: dayjs(record.date),
                    dueDate: dayjs(record.dueDate),
                  });
                }}
              >
                Modifier
              </Button>
              <Button type="text" icon={<SendOutlined />}>
                Envoyer
              </Button>
              <Button type="text" icon={<DownloadOutlined />}>
                Télécharger
              </Button>
              <Divider style={{ margin: '4px 0' }} />
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => {
                  Modal.confirm({
                    title: 'Supprimer la facture',
                    content: 'Êtes-vous sûr de vouloir supprimer cette facture ?',
                    onOk: () => dispatch(deleteInvoice(record.id)),
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
    const items: InvoiceItem[] = values.items || [];
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * 0.2; // 20% TVA
    const total = subtotal + tax;

    const invoiceData = {
      ...values,
      date: values.date.format('YYYY-MM-DD'),
      dueDate: values.dueDate.format('YYYY-MM-DD'),
      clientName: clients.find(c => c.id === values.clientId)?.name || '',
      items,
      subtotal,
      tax,
      total,
    };

    if (editingInvoice) {
      dispatch(updateInvoice({ ...editingInvoice, ...invoiceData }));
      message.success('Facture mise à jour');
    } else {
      const newInvoice: Invoice = {
        ...invoiceData,
        id: Date.now().toString(),
        number: `FAC-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
        status: 'draft',
      };
      dispatch(addInvoice(newInvoice));
      message.success('Facture créée');
    }
    setModalVisible(false);
    setEditingInvoice(null);
    form.resetFields();
  };

  return (
    <div>
      <div className="page-header">
        <Title level={2}>Gestion des factures</Title>
        <Text type="secondary">Créez et gérez vos factures</Text>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Search
            placeholder="Rechercher une facture..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingInvoice(null);
              setModalVisible(true);
              form.resetFields();
            }}
          >
            Nouvelle facture
          </Button>
        </Space>

        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} factures`,
          }}
        />
      </Card>

      {/* Modal de création/édition */}
      <Modal
        title={editingInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingInvoice(null);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            date: dayjs(),
            dueDate: dayjs().add(30, 'day'),
            items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="clientId"
                label="Client"
                rules={[{ required: true, message: 'Le client est requis' }]}
              >
                <Select placeholder="Sélectionner un client">
                  {clients.map(client => (
                    <Option key={client.id} value={client.id}>
                      {client.name} - {client.company}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'La date est requise' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="dueDate"
                label="Échéance"
                rules={[{ required: true, message: 'L\'échéance est requise' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Lignes de facturation</Divider>

          <Form.List name="items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row key={key} gutter={16} align="middle">
                    <Col span={8}>
                      <Form.Item
                        {...restField}
                        name={[name, 'description']}
                        rules={[{ required: true, message: 'Description requise' }]}
                      >
                        <Input placeholder="Description" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'quantity']}
                        rules={[{ required: true, message: 'Quantité requise' }]}
                      >
                        <InputNumber placeholder="Qté" min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        {...restField}
                        name={[name, 'unitPrice']}
                        rules={[{ required: true, message: 'Prix unitaire requis' }]}
                      >
                        <InputNumber 
                          placeholder="Prix unitaire" 
                          min={0} 
                          style={{ width: '100%' }}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item dependencies={[name]}>
                        {() => {
                          const items = form.getFieldValue('items') || [];
                          const item = items[name];
                          const total = (item?.quantity || 0) * (item?.unitPrice || 0);
                          return (
                            <Input 
                              value={`${total.toLocaleString()} TND`} 
                              disabled 
                              style={{ textAlign: 'right' }}
                            />
                          );
                        }}
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button 
                        type="text" 
                        danger 
                        onClick={() => remove(name)}
                      >
                        ×
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<PlusOutlined />}
                  >
                    Ajouter une ligne
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Notes ou conditions particulières" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoicesPage;