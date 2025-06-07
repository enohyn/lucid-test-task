import  { useCallback, useState, type ReactNode } from 'react';
import { Table, Input, Button, Dropdown, Menu } from 'antd';
import { FormulaCell } from './FormulaCells';
import type { ColumnType } from 'antd/es/table';
import { useFormulaStore } from '../store/causal-functionalities';

interface Row {
  key: string;
  name: string | ReactNode;
  formula: ReactNode | null;
  values: Record<string, any>;
}

export function FormulaTable() {
  const [data, setData] = useState<Row[]>([
    { key: '1', name: 'Existing1', formula: <FormulaCell rowKey="1" />, values: {} },
    { key: '2', name: 'Existing2', formula: <FormulaCell rowKey="2" />, values: {} },
  ]);
  const [newKey, setNewKey] = useState('');
  const { tokens } = useFormulaStore();


  const onNewChange = (text: string) => {
    setNewKey(text);
  };

  const addRow = (name: string) => {
    const key = name;
    setData([...data, { key, name, formula: <FormulaCell rowKey={key} />, values: {} }]);
    setNewKey('');
  };


  const computeResult = useCallback((rowKey: string): number => {
    const rowTokens = tokens[rowKey] || [];
    if (!rowTokens.length) return NaN;
    let acc = rowTokens[0].type === 'chip' ? rowTokens[0].value : NaN;
    for (let i = 1; i < rowTokens.length - 1; i += 2) {
      const op = rowTokens[i];
      const next = rowTokens[i + 1];
      if (op.type !== 'operator' || next.type !== 'chip') continue;
      switch (op.label) {
        case '+': acc += next.value; break;
        case '-': acc -= next.value; break;
        case '*': acc *= next.value; break;
        case '/': acc = next.value !== 0 ? acc / next.value : NaN; break;
        default: break;
      }
    }
    return acc;
  }, [tokens]);

  const columns: ColumnType<Row>[] = [
    {
      title: 'Variable', dataIndex: 'name', key: 'name', render: (_, row) => typeof row.name === 'string' ? (
        <div className="variable-cell">{row.name}
          <Button size="small" type="text" style={{ visibility: 'hidden', marginLeft: 8 }}>Edit</Button>
        </div>
      ) : row.name
    },
    { title: 'Formula', dataIndex: 'formula', key: 'formula', render: (_, row) => row.formula },
    {
        title: 'Result', key: 'result', render: (_, row) => {
          const res = computeResult(row.key);
          return isNaN(res) ? '-' : res;
        }
      },
  ];

  const rows = [...data, { key: 'new', name: (
    <Dropdown
      overlay={
        <Menu>
            <Menu.Item  onClick={() => addRow(newKey)}>{newKey}</Menu.Item>
        </Menu>
      }
      visible={!!newKey}
    >
      <Input
        placeholder="New variable"
        value={newKey}
        onChange={e => onNewChange(e.target.value)}
        onPressEnter={() => addRow(newKey)}
      />
    </Dropdown>
  ), formula: null, values: {} }];

  return (
    <Table<Row>
        className='w-full h-full'
      dataSource={rows}
      columns={columns}
      pagination={false}
        bordered
        size="large"
      rowClassName={record => record.key === 'new' ? 'new-row' : ''}
      rowKey="key"
    />
  );
}
