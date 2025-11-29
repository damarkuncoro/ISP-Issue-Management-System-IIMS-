
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, RefreshCw } from 'lucide-react';

interface WebTerminalProps {
  deviceName: string;
  ipAddress: string;
  model: string;
}

interface TerminalLine {
  type: 'input' | 'output' | 'system';
  content: string;
}

const WebTerminal: React.FC<WebTerminalProps> = ({ deviceName, ipAddress, model }) => {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isBooting, setIsBooting] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Boot Sequence Simulation
  useEffect(() => {
    const bootSequence = async () => {
      setLines([
        { type: 'system', content: `Connecting to ${ipAddress}:22...` },
      ]);
      await new Promise(r => setTimeout(r, 800));
      setLines(prev => [...prev, { type: 'system', content: 'Connection established.' }]);
      await new Promise(r => setTimeout(r, 500));
      setLines(prev => [...prev, 
        { type: 'system', content: `Welcome to ${model} Command Line Interface` },
        { type: 'system', content: 'Type "help" for available commands.' },
        { type: 'system', content: ' ' }
      ]);
      setIsBooting(false);
    };
    bootSequence();
  }, [ipAddress, model]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (!isBooting) inputRef.current?.focus();
  }, [lines, isBooting]);

  const executeCommand = async (cmd: string) => {
    const args = cmd.trim().split(' ');
    const command = args[0].toLowerCase();

    let response: string[] = [];

    switch (command) {
      case 'help':
      case '?':
        response = [
          'Available commands:',
          '  ping <ip>          Send ICMP echo requests',
          '  interface print    Show interface statistics',
          '  ip address print   Show IP configuration',
          '  system resource    Show system health',
          '  log print          Show recent system logs',
          '  clear              Clear terminal screen',
          '  reboot             Reboot the device'
        ];
        break;

      case 'clear':
      case 'cls':
        setLines([]);
        return;

      case 'ping':
        const target = args[1] || '8.8.8.8';
        setLines(prev => [...prev, { type: 'output', content: `PING ${target} 56(84) bytes of data.` }]);
        for (let i = 1; i <= 4; i++) {
          await new Promise(r => setTimeout(r, 800));
          const time = (Math.random() * 10 + 10).toFixed(1);
          setLines(prev => [...prev, { type: 'output', content: `64 bytes from ${target}: icmp_seq=${i} ttl=56 time=${time} ms` }]);
        }
        response = [`--- ${target} ping statistics ---`, '4 packets transmitted, 4 received, 0% packet loss'];
        break;

      case 'interface':
        if (args[1] === 'print') {
          response = [
            'Flags: X - disabled, R - running',
            ' #    NAME        TYPE       MTU   TX-PACKETS   RX-PACKETS',
            ' 0  R ether1      ether      1500  4239423      5920392',
            ' 1  R ether2      ether      1500  12039        0',
            ' 2  R sfp-sfpplus1 ether     1500  992384221    88237423',
            ' 3 X  wlan1       wlan       1500  0            0'
          ];
        } else {
          response = ['Invalid argument. Try "interface print"'];
        }
        break;

      case 'ip':
        if (args[1] === 'address' && args[2] === 'print') {
          response = [
            'Flags: X - disabled, I - invalid, D - dynamic',
            ' #   ADDRESS            NETWORK         INTERFACE',
            ` 0   ${ipAddress}/24      ${ipAddress.split('.').slice(0,3).join('.')}.0      ether1`,
            ' 1 D 192.168.88.1/24    192.168.88.0    bridge-local'
          ];
        } else {
          response = ['Invalid argument. Try "ip address print"'];
        }
        break;

      case 'system':
        if (args[1] === 'resource') {
          response = [
            `             uptime: ${Math.floor(Math.random() * 100)}d ${Math.floor(Math.random() * 24)}h`,
            '            version: 7.15.2 (stable)',
            `           cpu-load: ${Math.floor(Math.random() * 30)}%`,
            '      total-memory: 1024.0MiB',
            `       free-memory: ${Math.floor(Math.random() * 500 + 100)}.0MiB`,
            '           cpu-count: 4',
            `         board-name: ${model}`
          ];
        } else {
          response = ['Invalid argument. Try "system resource"'];
        }
        break;
      
      case 'log':
        response = [
          '14:20:01 system,info router rebooted',
          '14:20:05 interface,info ether1 link up (speed 1G)',
          '14:20:10 ppp,info pppoe-out1: connected',
          '15:00:23 system,error login failure for user admin from 192.168.1.50',
          '15:05:00 script,info backup script finished successfully'
        ];
        break;

      case 'reboot':
        setLines(prev => [...prev, { type: 'system', content: 'Rebooting system...' }]);
        setIsBooting(true);
        await new Promise(r => setTimeout(r, 2000));
        setLines([{ type: 'system', content: `Connecting to ${ipAddress}...` }]);
        await new Promise(r => setTimeout(r, 1000));
        setIsBooting(false);
        response = [`System rebooted. Welcome back to ${model}.`];
        break;

      case '':
        break;

      default:
        response = [`bad command: ${command}`];
    }

    if (response.length > 0) {
      response.forEach(line => {
        setLines(prev => [...prev, { type: 'output', content: line }]);
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = currentInput;
      setLines(prev => [...prev, { type: 'input', content: cmd }]);
      setCurrentInput('');
      executeCommand(cmd);
    }
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-2xl overflow-hidden font-mono text-sm border border-slate-700 h-[500px] flex flex-col">
      {/* Terminal Header */}
      <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal size={14} />
          <span className="text-xs font-bold">admin@{deviceName || 'device'} - SSH</span>
        </div>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-600"></div>
          <div className="w-3 h-3 rounded-full bg-slate-600"></div>
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        className="flex-1 p-4 overflow-y-auto text-slate-300 space-y-1 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, idx) => (
          <div key={idx} className={`${line.type === 'input' ? 'text-white font-bold' : line.type === 'system' ? 'text-blue-400' : 'text-green-400'}`}>
            {line.type === 'input' && <span className="text-blue-500 mr-2">[admin@{deviceName.split(' ')[0]}] &gt;</span>}
            <span className="whitespace-pre-wrap">{line.content}</span>
          </div>
        ))}
        
        {!isBooting && (
          <div className="flex items-center text-white font-bold">
             <span className="text-blue-500 mr-2">[admin@{deviceName.split(' ')[0]}] &gt;</span>
             <input 
                ref={inputRef}
                type="text" 
                className="bg-transparent border-none outline-none flex-1 text-white"
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
             />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default WebTerminal;
