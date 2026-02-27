import React, { useState, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { bulkImportParticipants } from '../../services/participantService';
import { useAuth } from '../../contexts/AuthContext';
import useAudioFeedback from '../../hooks/useAudioFeedback';

const REQUIRED_COLUMNS = ['full_name', 'email'];
const OPTIONAL_COLUMNS = ['phone', 'ticket_type', 'qr_id'];
const SAMPLE_CSV = `full_name,email,phone,ticket_type,qr_id
Alice Smith,alice.smith@example.com,+1 (555) 000-0001,VIP Pass,QR-SAMPLE-001
Bob Jones,bob.jones@example.com,+1 (555) 000-0002,General Admission,QR-SAMPLE-002
Carol White,carol.white@example.com,,Early Bird,`;

const parseCSV = (text) => {
  const lines = text?.trim()?.split(/\r?\n/);
  if (lines?.length < 2) return { headers: [], rows: [], error: 'CSV must have a header row and at least one data row.' };

  const headers = lines?.[0]?.split(',')?.map(h => h?.trim()?.toLowerCase()?.replace(/\s+/g, '_'));
  const missingRequired = REQUIRED_COLUMNS?.filter(col => !headers?.includes(col));
  if (missingRequired?.length > 0) {
    return { headers, rows: [], error: `Missing required columns: ${missingRequired?.join(', ')}. Expected: full_name, email` };
  }

  const rows = lines?.slice(1)?.map((line, idx) => {
    const values = line?.split(',')?.map(v => v?.trim());
    const row = {};
    headers?.forEach((h, i) => { row[h] = values?.[i] || ''; });
    row._lineNumber = idx + 2;
    return row;
  })?.filter(row => Object.values(row)?.some(v => v && v !== String(row?._lineNumber)));

  return { headers, rows, error: null };
};

const validateRow = (row) => {
  const errors = [];
  if (!row?.full_name?.trim()) errors?.push('Missing full name');
  if (!row?.email?.trim()) errors?.push('Missing email');
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(row?.email)) errors?.push('Invalid email format');
  return errors;
};

const CsvImport = () => {
  const { user } = useAuth();
  const { playSuccessSound, playErrorSound } = useAudioFeedback();
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [parseError, setParseError] = useState('');
  const [validationResults, setValidationResults] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState(null);
  const [step, setStep] = useState('upload'); // upload | preview | importing | done

  const processFile = useCallback((file) => {
    if (!file) return;
    if (!file?.name?.endsWith('.csv')) {
      setParseError('Please upload a .csv file.');
      return;
    }
    setFileName(file?.name);
    setParseError('');
    setParsedData(null);
    setImportResults(null);
    setStep('upload');

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e?.target?.result;
      const { headers, rows, error } = parseCSV(text);
      if (error) {
        setParseError(error);
        playErrorSound();
        return;
      }
      const validated = rows?.map(row => ({ ...row, _errors: validateRow(row) }));
      setParsedData({ headers, rows: validated });
      setValidationResults(validated);
      setStep('preview');
    };
    reader?.readAsText(file);
  }, [playErrorSound]);

  const handleFileChange = (e) => {
    processFile(e?.target?.files?.[0]);
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    setDragOver(false);
    processFile(e?.dataTransfer?.files?.[0]);
  };

  const handleDragOver = (e) => { e?.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);

  const handleImport = async () => {
    if (!parsedData) return;
    const validRows = parsedData?.rows?.filter(r => r?._errors?.length === 0);
    if (validRows?.length === 0) {
      playErrorSound();
      return;
    }

    setImporting(true);
    setStep('importing');
    setImportProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setImportProgress(prev => Math.min(prev + 10, 85));
    }, 200);

    const results = await bulkImportParticipants(validRows, user?.id);
    clearInterval(progressInterval);
    setImportProgress(100);

    setTimeout(() => {
      setImporting(false);
      setImportResults(results);
      setStep('done');
      if (results?.success > 0) {
        playSuccessSound();
      } else {
        playErrorSound();
      }
    }, 400);
  };

  const handleReset = () => {
    setFileName('');
    setParsedData(null);
    setParseError('');
    setValidationResults([]);
    setImportResults(null);
    setImportProgress(0);
    setStep('upload');
    if (fileInputRef?.current) fileInputRef.current.value = '';
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_participants.csv';
    a?.click();
    URL.revokeObjectURL(url);
  };

  const validCount = validationResults?.filter(r => r?._errors?.length === 0)?.length;
  const invalidCount = validationResults?.filter(r => r?._errors?.length > 0)?.length;

  return (
    <>
      <Helmet>
        <title>CSV Import - Conference Check-In</title>
        <meta name="description" content="Bulk import participants from CSV file" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <RoleBasedNavigation userRole="admin" />
        <div className="pt-16 md:pt-20 lg:pt-24">
          <div className="max-w-4xl mx-auto px-4 py-6 md:py-8 lg:py-10">
            {/* Header */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Bulk CSV Import
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Import multiple participants at once from a CSV file
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-6 md:mb-8">
              {['upload', 'preview', 'done']?.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    step === s || (step === 'importing' && s === 'preview')
                      ? 'bg-primary text-primary-foreground'
                      : (step === 'done' && i < 2) || (step === 'preview' && i < 1)
                        ? 'bg-success/20 text-success' :'bg-muted text-muted-foreground'
                  }`}>
                    <span>{i + 1}</span>
                    <span className="capitalize hidden sm:inline">{s === 'done' ? 'Complete' : s}</span>
                  </div>
                  {i < 2 && <div className="flex-1 h-px bg-border" />}
                </React.Fragment>
              ))}
            </div>

            {/* Upload Step */}
            {step === 'upload' && (
              <div className="space-y-4 md:space-y-6">
                <div
                  className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-colors cursor-pointer ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef?.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4">
                    <Icon name="Upload" size={32} color="var(--color-primary)" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {fileName ? fileName : 'Drop your CSV file here'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {fileName ? 'Processing...' : 'or click to browse files'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported format: .csv &bull; Required columns: full_name, email
                  </p>
                </div>

                {parseError && (
                  <div className="p-4 bg-error/10 border border-error/20 rounded-xl flex items-start gap-3">
                    <Icon name="AlertCircle" size={20} color="var(--color-error)" className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-error">{parseError}</p>
                  </div>
                )}

                {/* Column Guide */}
                <div className="bg-card border border-border rounded-2xl p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-foreground">CSV Format Guide</h3>
                    <Button variant="outline" size="sm" onClick={downloadSample} iconName="Download" iconPosition="left">
                      Sample CSV
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">Required Columns</p>
                      {REQUIRED_COLUMNS?.map(col => (
                        <div key={col} className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Icon name="CheckCircle2" size={14} color="var(--color-success)" />
                          <code className="bg-muted px-1.5 py-0.5 rounded">{col}</code>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground mb-2">Optional Columns</p>
                      {OPTIONAL_COLUMNS?.map(col => (
                        <div key={col} className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Icon name="Circle" size={14} color="var(--color-muted-foreground)" />
                          <code className="bg-muted px-1.5 py-0.5 rounded">{col}</code>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      <strong>ticket_type</strong> values: VIP Pass, General Admission, Early Bird, Student Pass, Speaker Pass
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Step */}
            {(step === 'preview' || step === 'importing') && parsedData && (
              <div className="space-y-4 md:space-y-6">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-card border border-border rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-foreground">{parsedData?.rows?.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total Rows</p>
                  </div>
                  <div className="bg-card border border-success/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-success">{validCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Valid</p>
                  </div>
                  <div className="bg-card border border-error/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-error">{invalidCount}</p>
                    <p className="text-xs text-muted-foreground mt-1">Invalid</p>
                  </div>
                </div>

                {/* Progress Bar (during import) */}
                {step === 'importing' && (
                  <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-foreground">Importing participants...</p>
                      <p className="text-sm font-bold text-primary">{importProgress}%</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${importProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Data Preview Table */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Preview ({Math.min(parsedData?.rows?.length, 10)} of {parsedData?.rows?.length} rows)</h3>
                    <span className="text-xs text-muted-foreground">{fileName}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">#</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Full Name</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Email</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Ticket Type</th>
                          <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData?.rows?.slice(0, 10)?.map((row, idx) => (
                          <tr key={idx} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 text-muted-foreground">{row?._lineNumber}</td>
                            <td className="px-4 py-3 text-foreground font-medium">{row?.full_name || <span className="text-error">—</span>}</td>
                            <td className="px-4 py-3 text-foreground">{row?.email || <span className="text-error">—</span>}</td>
                            <td className="px-4 py-3 text-muted-foreground">{row?.ticket_type || 'General Admission'}</td>
                            <td className="px-4 py-3">
                              {row?._errors?.length === 0 ? (
                                <span className="inline-flex items-center gap-1 text-xs text-success">
                                  <Icon name="CheckCircle2" size={12} color="var(--color-success)" /> Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-error" title={row?._errors?.join(', ')}>
                                  <Icon name="AlertCircle" size={12} color="var(--color-error)" /> {row?._errors?.[0]}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                {step === 'preview' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" size="lg" onClick={handleReset} iconName="X" iconPosition="left" fullWidth>
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleImport}
                      disabled={validCount === 0}
                      iconName="Upload"
                      iconPosition="left"
                      fullWidth
                    >
                      Import {validCount} Participant{validCount !== 1 ? 's' : ''}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Done Step */}
            {step === 'done' && importResults && (
              <div className="space-y-4 md:space-y-6">
                <div className={`bg-card border rounded-2xl p-6 md:p-8 text-center ${
                  importResults?.success > 0 ? 'border-success/30' : 'border-error/30'
                }`}>
                  <div className={`flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4 ${
                    importResults?.success > 0 ? 'bg-success/10' : 'bg-error/10'
                  }`}>
                    <Icon
                      name={importResults?.success > 0 ? 'CheckCircle2' : 'XCircle'}
                      size={32}
                      color={importResults?.success > 0 ? 'var(--color-success)' : 'var(--color-error)'}
                    />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    {importResults?.success > 0 ? 'Import Complete!' : 'Import Failed'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {importResults?.success > 0
                      ? `Successfully imported ${importResults?.success} participant${importResults?.success !== 1 ? 's' : ''}`
                      : 'No participants were imported'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="bg-card border border-success/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-success">{importResults?.success}</p>
                    <p className="text-xs text-muted-foreground mt-1">Imported</p>
                  </div>
                  <div className="bg-card border border-error/20 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-error">{importResults?.failed}</p>
                    <p className="text-xs text-muted-foreground mt-1">Failed</p>
                  </div>
                </div>

                {importResults?.errors?.length > 0 && (
                  <div className="bg-card border border-border rounded-xl p-4">
                    <p className="text-sm font-medium text-foreground mb-2">Import Notes</p>
                    {importResults?.errors?.map((err, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground mb-1">
                        <Icon name="Info" size={12} color="var(--color-muted-foreground)" className="mt-0.5 flex-shrink-0" />
                        <span>{err}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" size="lg" onClick={handleReset} iconName="RefreshCw" iconPosition="left" fullWidth>
                    Import Another File
                  </Button>
                  <Button variant="default" size="lg" onClick={() => window.location.href = '/admin-dashboard'} iconName="LayoutDashboard" iconPosition="left" fullWidth>
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CsvImport;
