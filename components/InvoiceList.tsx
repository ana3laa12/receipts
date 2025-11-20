
import React, { useState, useMemo } from 'react';
import { InvoiceData } from '../types';
import { FileText, Calendar, User, Copy, Check, ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2, X, Save, FileSpreadsheet } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface InvoiceListProps {
  invoices: InvoiceData[];
  onUpdateInvoice: (invoice: InvoiceData) => void;
  onDeleteInvoice: (id: string) => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ invoices = [], onUpdateInvoice, onDeleteInvoice }) => {
  const { t, language } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<InvoiceData>>({});

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc'
  });

  const handleSort = (key: string) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown size={12} className="text-gray-300 opacity-50 group-hover:opacity-100" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={12} className="text-primary-500" />
      : <ArrowDown size={12} className="text-primary-500" />;
  };

  const getDayName = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'long' });
      }
    } catch (e) {}
    return '';
  };

  const handleCopy = (invoice: InvoiceData) => {
    const text = `
${t('patientName')}: ${invoice.patientName}
${t('procedure')}: ${invoice.procedure}
${t('price')}: ${invoice.price} ${t('currency')}
${t('date')}: ${invoice.date} (${getDayName(invoice.date) || invoice.dayName})
    `.trim();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedId(invoice.id);
        setTimeout(() => setCopiedId(null), 2000);
      }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert(t('copyFail'));
      });
    } else {
      alert('Clipboard not supported');
    }
  };

  const startEditing = (invoice: InvoiceData) => {
    setEditingId(invoice.id);
    setEditForm({ ...invoice });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEditing = (id: string) => {
    if (editForm && editingId === id) {
      onUpdateInvoice(editForm as InvoiceData);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleInputChange = (field: keyof InvoiceData, value: string) => {
    setEditForm(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'date') {
         newData.dayName = getDayName(value);
      }
      return newData;
    });
  };

  const exportToExcel = () => {
    // CSV Export with BOM for UTF-8 support (Arabic)
    const headers = [t('patientName'), t('procedure'), `${t('price')} (${t('currency')})`, t('date'), 'Day Name'];
    
    const csvRows = [
      headers.join(','),
      ...invoices.map(inv => [
        `"${inv.patientName}"`,
        `"${inv.procedure}"`,
        `"${inv.price}"`,
        `"${inv.date}"`,
        `"${getDayName(inv.date) || inv.dayName}"`
      ].join(','))
    ];

    const csvContent = "\uFEFF" + csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToDoc = () => {
    const tableHtml = `
      <table border="1" style="width:100%; border-collapse: collapse; direction: ${language === 'ar' ? 'rtl' : 'ltr'}; font-family: 'Cairo', sans-serif;">
        <thead>
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 10px;">${t('patientName')}</th>
            <th style="padding: 10px;">${t('procedure')}</th>
            <th style="padding: 10px;">${t('price')} (${t('currency')})</th>
            <th style="padding: 10px;">${t('date')}</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.map(inv => `
            <tr>
              <td style="padding: 8px;">${inv.patientName}</td>
              <td style="padding: 8px;">${inv.procedure}</td>
              <td style="padding: 8px;">${inv.price}</td>
              <td style="padding: 8px;">${inv.date} (${getDayName(inv.date) || inv.dayName})</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    const fullHtml = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Invoices</title>
      </head>
      <body>
        <h2 style="text-align: center;">${t('invoiceLog')}</h2>
        ${tableHtml}
      </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'application/msword' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `invoices_${new Date().toISOString().split('T')[0]}.doc`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const groupedInvoices = useMemo(() => {
    if (!Array.isArray(invoices)) return {};
    
    const sorted = [...invoices].sort((a, b) => {
      let valA: any = a[sortConfig.key as keyof InvoiceData] || '';
      let valB: any = b[sortConfig.key as keyof InvoiceData] || '';

      if (sortConfig.key === 'price') {
        const numA = parseFloat(valA.toString().replace(/[^0-9.-]+/g, '')) || 0;
        const numB = parseFloat(valB.toString().replace(/[^0-9.-]+/g, '')) || 0;
        valA = numA;
        valB = numB;
      } else if (sortConfig.key === 'date') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
        if (isNaN(valA)) valA = 0;
        if (isNaN(valB)) valB = 0;
      } else {
        valA = valA.toString().toLowerCase();
        valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    if (sortConfig.key === 'date') {
      const groups: Record<string, InvoiceData[]> = {};
      sorted.forEach(invoice => {
        try {
          const date = new Date(invoice.date);
          if (isNaN(date.getTime())) throw new Error("Invalid date");
          const key = new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' }).format(date);
          if (!groups[key]) groups[key] = [];
          groups[key].push(invoice);
        } catch (e) {
          const key = t('unknownDate');
          if (!groups[key]) groups[key] = [];
          groups[key].push(invoice);
        }
      });
      return groups;
    } else {
      const title = t('allInvoices');
      return { [title]: sorted };
    }
  }, [invoices, sortConfig, language, t]);

  if (!invoices || invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="bg-gray-50 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{t('noInvoices')}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('startUpload')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <FileText className="text-primary-500 w-5 h-5 md:w-6 md:h-6" />
          <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white">
            {t('invoiceLog')}
          </h2>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToExcel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300 text-xs md:text-sm font-medium rounded-lg transition-colors border border-green-200 dark:border-green-800"
          >
            <FileSpreadsheet size={16} />
            <span>{t('exportExcel')}</span>
          </button>
          <button 
            onClick={exportToDoc}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs md:text-sm font-medium rounded-lg transition-colors border border-blue-200 dark:border-blue-800"
          >
            <FileText size={16} />
            <span>{t('exportDoc')}</span>
          </button>
        </div>
      </div>

      {Object.entries(groupedInvoices).map(([groupTitle, groupInvoices]) => (
        <div key={groupTitle} className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="px-4 py-3 md:px-6 md:py-4 bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-primary-700 dark:text-primary-400 text-base md:text-lg">
              {groupTitle}
            </h3>
            <span className="text-[10px] md:text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded-full border border-gray-200 dark:border-gray-500 text-gray-500 dark:text-gray-300">
              {t('invoiceCount', { count: (groupInvoices as InvoiceData[]).length })}
            </span>
          </div>
          
          <div className="overflow-x-auto pb-2 md:pb-0">
            <table className="w-full text-right rtl:text-right ltr:text-left min-w-[600px] md:min-w-0">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-xs md:text-sm font-medium">
                <tr>
                  <th 
                    className="px-3 py-3 md:px-6 md:py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group select-none w-[25%]"
                    onClick={() => handleSort('patientName')}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      {t('patientName')}
                      {getSortIcon('patientName')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-3 md:px-6 md:py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group select-none w-[20%]"
                    onClick={() => handleSort('procedure')}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      {t('procedure')}
                      {getSortIcon('procedure')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-3 md:px-6 md:py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group select-none w-[15%]"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      {t('price')}
                      {getSortIcon('price')}
                    </div>
                  </th>
                  <th 
                    className="px-3 py-3 md:px-6 md:py-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group select-none w-[20%]"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center gap-1 md:gap-2">
                      {t('date')}
                      {getSortIcon('date')}
                    </div>
                  </th>
                  <th className="px-3 py-3 md:px-6 md:py-4 text-center w-[20%]">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-xs md:text-sm">
                {(groupInvoices as InvoiceData[]).map((invoice) => {
                  const isEditing = editingId === invoice.id;
                  const displayDayName = getDayName(invoice.date) || invoice.dayName;
                  
                  return (
                    <tr key={invoice.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group ${isEditing ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        {isEditing ? (
                           <input 
                             type="text" 
                             value={editForm.patientName || ''}
                             onChange={(e) => handleInputChange('patientName', e.target.value)}
                             className="w-full p-1.5 md:p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs md:text-sm"
                           />
                        ) : (
                          <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                              <User size={12} className="md:w-4 md:h-4" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{invoice.patientName}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4 text-gray-600 dark:text-gray-300">
                        {isEditing ? (
                           <input 
                             type="text" 
                             value={editForm.procedure || ''}
                             onChange={(e) => handleInputChange('procedure', e.target.value)}
                             className="w-full p-1.5 md:p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs md:text-sm"
                           />
                        ) : (
                          invoice.procedure
                        )}
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4">
                        {isEditing ? (
                           <input 
                             type="number"
                             value={editForm.price || ''}
                             onChange={(e) => handleInputChange('price', e.target.value)}
                             className="w-16 md:w-24 p-1.5 md:p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs md:text-sm"
                           />
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            {invoice.price} <span className="text-[10px] mx-1 opacity-75">{t('currency')}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4 text-gray-500 dark:text-gray-400">
                         {isEditing ? (
                           <div className="flex flex-col gap-1">
                             <input 
                               type="date" 
                               value={editForm.date || ''}
                               onChange={(e) => handleInputChange('date', e.target.value)}
                               className="w-full p-1.5 md:p-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs md:text-sm"
                             />
                             <span className="text-[10px] text-primary-600">{editForm.dayName || displayDayName}</span>
                           </div>
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1 md:gap-2">
                              <Calendar size={12} className="md:w-3.5 md:h-3.5" />
                              <span className="whitespace-nowrap">{invoice.date}</span>
                            </div>
                            {displayDayName && (
                              <span className="text-[10px] md:text-xs text-primary-600 dark:text-primary-400 font-medium mt-0.5 rtl:mr-4 md:rtl:mr-5 ltr:ml-4 md:ltr:ml-5">
                                {displayDayName}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 md:px-6 md:py-4 text-center">
                        <div className="flex items-center justify-center gap-1 md:gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => saveEditing(invoice.id)}
                                className="p-1.5 md:p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                                title={t('save')}
                              >
                                <Save size={14} className="md:w-4 md:h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="p-1.5 md:p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                title={t('cancel')}
                              >
                                <X size={14} className="md:w-4 md:h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleCopy(invoice)}
                                className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-blue-600 transition-colors"
                                title={t('copy')}
                              >
                                {copiedId === invoice.id ? <Check size={14} className="text-green-500 md:w-4 md:h-4" /> : <Copy size={14} className="md:w-4 md:h-4" />}
                              </button>
                              <button
                                onClick={() => startEditing(invoice)}
                                className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-400 hover:text-orange-500 transition-colors"
                                title={t('edit')}
                              >
                                <Edit2 size={14} className="md:w-4 md:h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if(window.confirm(t('deleteConfirm'))) onDeleteInvoice(invoice.id)
                                }}
                                className="p-1.5 md:p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                                title={t('delete')}
                              >
                                <Trash2 size={14} className="md:w-4 md:h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};
