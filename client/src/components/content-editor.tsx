import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, ListOrdered, Image, Link, Code, Quote, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Undo, Redo } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function ContentEditor() {
  const [content, setContent] = useState('');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Update history when content changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== history[historyIndex]) {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(content);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [content]);

  const execCommand = (command: string, value?: string) => {
    const editor = document.getElementById('editor');
    if (editor) {
      editor.focus();
      document.execCommand(command, false, value);
      setContent(editor.innerHTML);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const editor = document.getElementById('editor');
      if (editor) {
        editor.innerHTML = history[historyIndex - 1];
        setContent(history[historyIndex - 1]);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const editor = document.getElementById('editor');
      if (editor) {
        editor.innerHTML = history[historyIndex + 1];
        setContent(history[historyIndex + 1]);
      }
    }
  };

  const insertImage = () => {
    const url = prompt('Resim URL\'sini girin:');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const insertLink = () => {
    const url = prompt('Link URL\'sini girin:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  const handleEditorChange = () => {
    const editor = document.getElementById('editor');
    if (editor) {
      setContent(editor.innerHTML);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Editor Section */}
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>İçerik Editörü</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border rounded-lg p-2 mb-4 bg-gray-50">
            <div className="flex flex-wrap gap-1">
              {/* History controls */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2"
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2"
              >
                <Redo className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-8 mx-1" />
              
              {/* Text formatting */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('bold')}
                className="p-2"
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('italic')}
                className="p-2"
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('underline')}
                className="p-2"
              >
                <Underline className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-8 mx-1" />
              
              {/* Headings */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('formatBlock', 'H1')}
                className="p-2"
              >
                <Heading1 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('formatBlock', 'H2')}
                className="p-2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('formatBlock', 'H3')}
                className="p-2"
              >
                <Heading3 className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-8 mx-1" />
              
              {/* Lists */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertUnorderedList')}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('insertOrderedList')}
                className="p-2"
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-8 mx-1" />
              
              {/* Alignment */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyLeft')}
                className="p-2"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyCenter')}
                className="p-2"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('justifyRight')}
                className="p-2"
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              
              <Separator orientation="vertical" className="h-8 mx-1" />
              
              {/* Insert elements */}
              <Button
                variant="ghost"
                size="sm"
                onClick={insertLink}
                className="p-2"
              >
                <Link className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={insertImage}
                className="p-2"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('formatBlock', 'BLOCKQUOTE')}
                className="p-2"
              >
                <Quote className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => execCommand('formatBlock', 'PRE')}
                className="p-2"
              >
                <Code className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 border rounded-lg overflow-hidden">
            <div
              id="editor"
              contentEditable
              className="w-full h-full p-4 outline-none overflow-auto"
              onInput={handleEditorChange}
              onPaste={handlePaste}
              style={{ minHeight: '400px' }}
            >
              <p>İçeriğinizi buraya yazın...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>HTML Önizleme</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="border rounded-lg p-4 h-full overflow-auto bg-white">
            <div 
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400">Önizleme burada görünecek...</p>' }} 
            />
          </div>
          
          {/* HTML Code Preview */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">HTML Kodu:</h4>
            <pre className="border rounded-lg p-4 bg-gray-50 overflow-auto text-xs">
              <code>{content || '<p>İçerik girilmedi</p>'}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}