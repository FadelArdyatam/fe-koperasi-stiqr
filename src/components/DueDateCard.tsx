import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, Calendar, DollarSign } from 'lucide-react';
import { formatRupiah } from '@/hooks/convertRupiah';

interface DueDate {
  id: string;
  due_date: string;
  amount_required: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  saving_type: 'POKOK' | 'WAJIB' | 'SUKARELA';
  paid_at?: string;
  expired_at?: string;
  next_due_date?: string;
}

interface DueDateCardProps {
  dueDate: DueDate;
  onPayNow?: () => void;
  showActions?: boolean;
}

const DueDateCard: React.FC<DueDateCardProps> = ({ 
  dueDate, 
  onPayNow, 
  showActions = true 
}) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Belum Dibayar',
          badgeColor: 'bg-yellow-500'
        };
      case 'PAID':
        return {
          icon: <CheckCircle className="w-4 h-4" />,
          color: 'bg-green-100 text-green-800',
          label: 'Sudah Dibayar',
          badgeColor: 'bg-green-500'
        };
      case 'EXPIRED':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'bg-red-100 text-red-800',
          label: 'Terlambat',
          badgeColor: 'bg-red-500'
        };
      case 'CANCELLED':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800',
          label: 'Dibatalkan',
          badgeColor: 'bg-gray-500'
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          color: 'bg-gray-100 text-gray-800',
          label: 'Unknown',
          badgeColor: 'bg-gray-500'
        };
    }
  };

  const getSavingTypeLabel = (type: string) => {
    switch (type) {
      case 'POKOK': return 'Simpanan Pokok';
      case 'WAJIB': return 'Simpanan Wajib';
      case 'SUKARELA': return 'Simpanan Sukarela';
      default: return type;
    }
  };

  const isOverdue = () => {
    if (dueDate.status !== 'PENDING') return false;
    return new Date(dueDate.due_date) < new Date();
  };

  const getDaysUntilDue = () => {
    const today = new Date();
    const dueDateObj = new Date(dueDate.due_date);
    const diffTime = dueDateObj.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const statusInfo = getStatusInfo(dueDate.status);
  const overdue = isOverdue();
  const daysUntilDue = getDaysUntilDue();

  return (
    <Card className={`${overdue ? 'border-red-200 bg-red-50' : ''} transition-all hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {getSavingTypeLabel(dueDate.saving_type)}
          </CardTitle>
          <Badge className={`${statusInfo.color} border-0`}>
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              {statusInfo.label}
            </div>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Jumlah:</span>
            </div>
            <span className="font-semibold text-lg">
              {formatRupiah(dueDate.amount_required)}
            </span>
          </div>

          {/* Due Date */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Jatuh Tempo:</span>
            <span className={`text-sm font-medium ${overdue ? 'text-red-600' : ''}`}>
              {new Date(dueDate.due_date).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>

          {/* Days until due or overdue */}
          {dueDate.status === 'PENDING' && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-yellow-600'}`}>
                {overdue 
                  ? `Terlambat ${Math.abs(daysUntilDue)} hari`
                  : daysUntilDue > 0 
                    ? `Tersisa ${daysUntilDue} hari`
                    : 'Hari ini jatuh tempo'
                }
              </span>
            </div>
          )}

          {/* Paid date */}
          {dueDate.status === 'PAID' && dueDate.paid_at && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Dibayar:</span>
              <span className="text-sm font-medium text-green-600">
                {new Date(dueDate.paid_at).toLocaleDateString('id-ID')}
              </span>
            </div>
          )}

          {/* Next due date */}
          {dueDate.next_due_date && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Jatuh Tempo Berikutnya:</span>
              <span className="text-sm font-medium text-blue-600">
                {new Date(dueDate.next_due_date).toLocaleDateString('id-ID')}
              </span>
            </div>
          )}

          {/* Action Button */}
          {showActions && dueDate.status === 'PENDING' && (
            <div className="pt-2 border-t">
              <Button 
                onClick={onPayNow}
                className="w-full"
                variant={overdue ? "destructive" : "default"}
                size="sm"
              >
                {overdue ? 'Bayar Sekarang' : 'Bayar Simpanan'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DueDateCard;
